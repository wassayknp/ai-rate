// First, let's create a simplified test version of your voice search hook
// to identify what's going wrong

import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';

type VoiceSearchState = {
  isListening: boolean;
  error: string | null;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
};

export default function useVoiceSearchDebug(
  onResult: (text: string) => void,
  showToast?: (message: string, position?: 'top' | 'center' | 'bottom') => void
): VoiceSearchState {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add detailed logging to understand what's happening
  useEffect(() => {
    console.log('🚀 VoiceSearch Hook initialized');
    console.log('Platform:', Platform.OS);
    console.log('Navigator available:', !!navigator);
    console.log('MediaDevices available:', !!(navigator?.mediaDevices));
    console.log('getUserMedia available:', !!(navigator?.mediaDevices?.getUserMedia));
    console.log('MediaRecorder available:', typeof MediaRecorder !== 'undefined');
    
    if (Platform.OS === 'web') {
      console.log('Web Speech Recognition available:', !!((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition));
      console.log('Current URL:', window.location.href);
      console.log('Is HTTPS:', window.location.protocol === 'https:');
      console.log('Is localhost:', window.location.hostname === 'localhost');
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('🧹 Cleaning up voice search hook');
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const startListening = useCallback(async () => {
    console.log('🎤 START LISTENING CALLED');
    console.log('Current state - isListening:', isListening);
    console.log('Current state - error:', error);
    console.log('Current state - isSupported:', isSupported);
    
    try {
      setError(null);
      setIsListening(true);
      
      console.log('✅ State updated - isListening set to true');
      
      // Immediate feedback
      if (showToast) {
        showToast('🎤 Starting voice search...', 'center');
      }
      
      // Add haptic feedback
      if (Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          console.log('✅ Haptic feedback triggered');
        } catch (e) {
          console.log('⚠️ Haptic feedback failed:', e);
        }
      }
      
      // Check platform and try appropriate method
      if (Platform.OS === 'web') {
        await handleWebVoiceSearch();
      } else {
        await handleMobileVoiceSearch();
      }
      
    } catch (err) {
      console.error('❌ Critical error in startListening:', err);
      setError(`Failed to start: ${err}`);
      setIsListening(false);
      if (showToast) {
        showToast(`❌ Error: ${err}`, 'center');
      }
    }
  }, [isListening, error, isSupported, showToast]);

  const handleWebVoiceSearch = useCallback(async () => {
    console.log('🌐 Handling web voice search');
    
    // Check HTTPS requirement
    const isSecure = window.location.protocol === 'https:' || 
                     window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1';
    
    if (!isSecure) {
      throw new Error('HTTPS required for microphone access');
    }
    
    // Try Web Speech Recognition first
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (SpeechRecognition) {
      console.log('🎯 Trying Web Speech Recognition API');
      await tryWebSpeechRecognition(SpeechRecognition);
    } else {
      console.log('🎯 Web Speech not available, trying MediaRecorder');
      await tryMediaRecorderMethod();
    }
  }, []);

  const handleMobileVoiceSearch = useCallback(async () => {
    console.log('📱 Handling mobile voice search');
    // For now, always use MediaRecorder method on mobile
    await tryMediaRecorderMethod();
  }, []);

  const tryWebSpeechRecognition = useCallback(async (SpeechRecognition: any) => {
    return new Promise<void>((resolve, reject) => {
      console.log('🎤 Setting up Web Speech Recognition');
      
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('✅ Web Speech Recognition started');
        if (showToast) {
          showToast('🎤 Listening... (Web Speech API)', 'center');
        }
        resolve();
      };
      
      recognition.onresult = (event: any) => {
        console.log('🔊 Web Speech Recognition result:', event);
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript.trim();
          console.log('📝 Transcript:', transcript);
          
          if (transcript) {
            onResult(transcript);
            if (showToast) {
              showToast(`✅ Heard: "${transcript}"`, 'center');
            }
          }
        }
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('❌ Web Speech Recognition error:', event);
        setError(`Speech error: ${event.error}`);
        setIsListening(false);
        if (showToast) {
          showToast(`❌ Speech error: ${event.error}`, 'center');
        }
        reject(new Error(event.error));
      };
      
      recognition.onend = () => {
        console.log('🔚 Web Speech Recognition ended');
        setIsListening(false);
      };
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Auto-stopping Web Speech Recognition');
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.log('Error stopping recognition:', e);
          }
        }
      }, 10000);
      
      try {
        console.log('▶️ Starting Web Speech Recognition...');
        recognition.start();
      } catch (error) {
        console.error('❌ Failed to start Web Speech Recognition:', error);
        reject(error);
      }
    });
  }, [onResult, showToast]);

  const tryMediaRecorderMethod = useCallback(async () => {
    console.log('🎙️ Trying MediaRecorder method');
    
    try {
      // Request microphone permission
      console.log('📋 Requesting microphone permission...');
      
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error('MediaDevices API not available');
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('✅ Microphone permission granted');
      console.log('🎵 Audio stream:', stream);
      console.log('🎵 Audio tracks:', stream.getAudioTracks());
      
      streamRef.current = stream;
      
      if (showToast) {
        showToast('🎤 Recording... (MediaRecorder)', 'center');
      }
      
      // Check MediaRecorder support
      if (typeof MediaRecorder === 'undefined') {
        throw new Error('MediaRecorder not supported');
      }
      
      // Find supported MIME type
      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
        'audio/wav'
      ];
      
      let mimeType = 'audio/webm';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      console.log('🎵 Using MIME type:', mimeType);
      console.log('🎵 MIME type supported:', MediaRecorder.isTypeSupported(mimeType));
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        console.log('📊 Data available:', event.data.size, 'bytes');
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        console.log('🛑 MediaRecorder stopped');
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        console.log('📁 Final audio blob size:', audioBlob.size, 'bytes');
        
        if (audioBlob.size === 0) {
          console.error('❌ Empty audio blob');
          if (showToast) {
            showToast('❌ No audio recorded', 'center');
          }
          setIsListening(false);
          return;
        }
        
        // Send to STT API
        try {
          console.log('🌐 Sending to STT API...');
          if (showToast) {
            showToast('🔄 Processing voice...', 'center');
          }
          
          const formData = new FormData();
          const fileExtension = mimeType.includes('webm') ? 'webm' : 'mp4';
          formData.append('audio', audioBlob, `recording.${fileExtension}`);
          
          const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
            method: 'POST',
            body: formData,
          });
          
          console.log('📡 STT API response status:', response.status);
          
          if (response.ok) {
            const result = await response.json();
            console.log('🔊 STT result:', result);
            
            if (result.text && result.text.trim()) {
              onResult(result.text.trim());
              if (showToast) {
                showToast(`✅ Heard: "${result.text.trim()}"`, 'center');
              }
            } else {
              console.log('🔇 No speech detected in result');
              if (showToast) {
                showToast('🔇 No speech detected', 'center');
              }
            }
          } else {
            const errorText = await response.text();
            console.error('❌ STT API error:', response.status, errorText);
            throw new Error(`STT API failed: ${response.status}`);
          }
        } catch (sttError) {
          console.error('❌ STT processing error:', sttError);
          if (showToast) {
            showToast('❌ Voice processing failed', 'center');
          }
        }
        
        setIsListening(false);
        
        // Cleanup
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.onstart = () => {
        console.log('▶️ MediaRecorder started');
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        setError('Recording failed');
        setIsListening(false);
        if (showToast) {
          showToast('❌ Recording failed', 'center');
        }
      };
      
      console.log('▶️ Starting MediaRecorder...');
      mediaRecorder.start(1000); // Collect data every second
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        console.log('⏰ Auto-stopping MediaRecorder');
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 10000);
      
    } catch (micError) {
      console.error('❌ Microphone error:', micError);
      setError(`Microphone error: ${micError}`);
      setIsListening(false);
      
      if (showToast) {
        showToast(`❌ Microphone error: ${micError}`, 'center');
      }
      
      // Show detailed error info
      Alert.alert(
        'Microphone Access Error',
        `Error: ${micError}\n\nPlease check:\n• Microphone permissions\n• HTTPS connection\n• Browser compatibility`,
        [{ text: 'OK' }]
      );
    }
  }, [onResult, showToast]);

  const stopListening = useCallback(async () => {
    console.log('🛑 STOP LISTENING CALLED');
    
    if (!isListening) {
      console.log('⚠️ Not currently listening, ignoring stop request');
      return;
    }

    setIsListening(false);
    
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Haptic feedback
    if (Platform.OS !== 'web') {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    
    // Stop Web Speech Recognition
    if (recognitionRef.current) {
      try {
        console.log('🛑 Stopping Web Speech Recognition');
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping speech recognition:', error);
      }
      recognitionRef.current = null;
    }
    
    // Stop MediaRecorder
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        console.log('🛑 Stopping MediaRecorder');
        mediaRecorderRef.current.stop();
      } catch (error) {
        console.log('Error stopping media recorder:', error);
      }
    }
    
    // Clean up stream
    if (streamRef.current) {
      console.log('🧹 Cleaning up audio stream');
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (showToast) {
      showToast('🔇 Voice search stopped', 'center');
    }
  }, [isListening, showToast]);

  return {
    isListening,
    error,
    isSupported,
    startListening,
    stopListening
  };
}
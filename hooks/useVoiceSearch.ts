import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
// Import Expo Speech for native speech recognition

// For React Native, we'll need to use expo-speech for TTS and a speech recognition library
// Note: You'll need to install: expo install expo-speech @react-native-voice/voice
// Uncomment the line below if using @react-native-voice/voice

type VoiceSearchState = {
  isListening: boolean;
  error: string | null;
  isSupported: boolean;
  startListening: () => Promise<void>;
  stopListening: () => void;
};

export default function useVoiceSearch(
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
  const nativeVoiceAvailable = useRef<boolean>(false);

  // Check platform support and native capabilities on mount
  useEffect(() => {
    const checkSupport = async () => {
      console.log('🔍 Checking voice search support...');
      console.log('Platform:', Platform.OS);
      
      if (Platform.OS === 'web') {
        // Web platform checks
        const hasMediaDevices = !!(navigator?.mediaDevices?.getUserMedia);
        const hasSpeechRecognition = !!(
          typeof window !== 'undefined' && 
          ((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition)
        );
        const hasMediaRecorder = !!(typeof MediaRecorder !== 'undefined');
        const isSecure = typeof window !== 'undefined' && (
          window.location.protocol === 'https:' || 
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1'
        );
        
        console.log('Web support check:', {
          hasMediaDevices,
          hasSpeechRecognition,
          hasMediaRecorder,
          isSecure
        });
        
        const supported = hasMediaDevices && (hasSpeechRecognition || hasMediaRecorder) && isSecure;
        setIsSupported(supported);
        nativeVoiceAvailable.current = hasSpeechRecognition;
        
        if (!supported) {
          let reason = 'Unknown error';
          if (!isSecure) reason = 'HTTPS required';
          else if (!hasMediaDevices) reason = 'MediaDevices API not supported';
          else if (!hasMediaRecorder) reason = 'MediaRecorder not supported';
          
          setError(`Voice search not supported: ${reason}`);
        }
      } else {
        // React Native (iOS/Android) - Check for native voice recognition
        console.log('React Native support check for', Platform.OS);
        
        try {
          // Check if @react-native-voice/voice is available
          // Uncomment these lines if you have the library installed:
          /*
          const Voice = require('@react-native-voice/voice');
          const isAvailable = await Voice.isAvailable();
          nativeVoiceAvailable.current = isAvailable;
          console.log('Native voice recognition available:', isAvailable);
          */
          
          // For now, we'll assume native voice is not available and use fallback
          nativeVoiceAvailable.current = false;
          
          // Check MediaRecorder as fallback
          const hasMediaDevices = !!(navigator?.mediaDevices?.getUserMedia);
          console.log('MediaRecorder fallback available:', hasMediaDevices);
          
          setIsSupported(true); // Always supported on mobile with STT fallback
        } catch (error) {
          console.log('Error checking native voice support:', error);
          nativeVoiceAvailable.current = false;
          setIsSupported(true); // Still supported with STT fallback
        }
      }
    };

    checkSupport();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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
      
      // Cleanup native voice if available
      // Uncomment if using @react-native-voice/voice:
      /*
      if (Platform.OS !== 'web' && nativeVoiceAvailable.current) {
        try {
          const Voice = require('@react-native-voice/voice');
          Voice.destroy();
        } catch (e) {}
      }
      */
    };
  }, []);

  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      console.log('🎤 Requesting microphone permission...');
      
      if (Platform.OS !== 'web') {
        // For React Native, check native voice permissions first
        if (nativeVoiceAvailable.current) {
          console.log('📱 Requesting native voice permissions');
          // Native voice recognition handles its own permissions
          return true;
        }
        
        console.log('📱 Native voice not available, requesting microphone for recording');
      }
      
      if (!navigator?.mediaDevices?.getUserMedia) {
        const errorMsg = `Microphone not available on this ${Platform.OS === 'web' ? 'browser' : 'device'}`;
        setError(errorMsg);
        if (showToast) {
          showToast(`❌ ${errorMsg}`, 'center');
        }
        return false;
      }

      // Check current permission status (web only)
      if (Platform.OS === 'web' && 'permissions' in navigator) {
        try {
          const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          console.log('🔍 Current microphone permission:', permission.state);
          
          if (permission.state === 'denied') {
            setError('Microphone access denied. Please enable in browser settings.');
            if (showToast) {
              showToast('❌ Microphone denied. Check browser settings.', 'center');
            }
            return false;
          }
        } catch (permError) {
          console.log('⚠️ Could not check permission status:', permError);
        }
      }

      // Request access with platform-optimized constraints
      const constraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          ...(Platform.OS === 'web' ? {
            sampleRate: 16000,
            channelCount: 1
          } : {
            // Mobile-optimized settings
            sampleRate: { ideal: 16000 },
            channelCount: { ideal: 1 }
          })
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('✅ Microphone permission granted');
      streamRef.current = stream;
      return true;

    } catch (error: any) {
      console.error('❌ Microphone permission error:', error);
      
      let errorMessage = 'Microphone access failed';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = Platform.OS === 'web' 
          ? 'Microphone access denied. Please allow microphone access in browser settings.'
          : 'Microphone access denied. Please allow microphone access in app settings.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No microphone found on this device.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = Platform.OS === 'web' 
          ? 'Microphone not supported in this browser.'
          : 'Microphone not supported on this device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Microphone is already in use by another application.';
      } else if (error.name === 'SecurityError') {
        errorMessage = Platform.OS === 'web' 
          ? 'Security error. Please use HTTPS.'
          : 'Security error accessing microphone.';
      }
      
      setError(errorMessage);
      
      if (showToast) {
        showToast(`❌ ${errorMessage}`, 'center');
      }
      
      // Platform-specific permission instructions
      const instructions = Platform.OS === 'web' 
        ? 'To enable:\n• Click the microphone icon in your browser\'s address bar\n• Or go to browser settings and allow microphone for this site'
        : Platform.OS === 'ios'
        ? 'To enable:\n• Go to Settings > Privacy & Security > Microphone\n• Enable microphone access for this app'
        : 'To enable:\n• Go to Settings > Apps > [App Name] > Permissions\n• Enable microphone access';
      
      Alert.alert(
        'Microphone Permission Required',
        `${errorMessage}\n\n${instructions}`,
        [{ text: 'OK' }]
      );
      
      return false;
    }
  }, [showToast]);

  // Native Voice Recognition (React Native only)
  const startNativeVoiceRecognition = useCallback(async (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (Platform.OS === 'web' || !nativeVoiceAvailable.current) {
        reject(new Error('Native voice recognition not available'));
        return;
      }

      try {
        console.log('🎤 Starting native voice recognition');
        
        // Uncomment and modify this section if using @react-native-voice/voice:
        /*
        const Voice = require('@react-native-voice/voice');
        
        Voice.onSpeechStart = () => {
          console.log('🎤 Native speech started');
          if (showToast) {
            showToast('🎤 Listening... (Speak now)', 'center');
          }
          resolve();
        };
        
        Voice.onSpeechResults = (event: any) => {
          console.log('🔊 Native speech results:', event.value);
          if (event.value && event.value.length > 0) {
            const transcript = event.value[0].trim();
            if (transcript) {
              onResult(transcript);
              if (showToast) {
                showToast(`✅ Heard: "${transcript}"`, 'center');
              }
            }
          }
          setIsListening(false);
        };
        
        Voice.onSpeechError = (event: any) => {
          console.error('❌ Native speech error:', event);
          setError(`Native voice error: ${event.error?.message || 'Unknown error'}`);
          setIsListening(false);
          if (showToast) {
            showToast('❌ Voice recognition failed', 'center');
          }
          reject(new Error(event.error?.message || 'Native voice recognition failed'));
        };
        
        Voice.onSpeechEnd = () => {
          console.log('🔚 Native speech ended');
          setIsListening(false);
        };
        
        // Start recognition
        await Voice.start('en-US');
        
        // Auto-stop after 10 seconds
        timeoutRef.current = setTimeout(async () => {
          try {
            await Voice.stop();
          } catch (e) {
            console.log('Error stopping native voice:', e);
          }
        }, 10000);
        */
        
        // For now, reject since we don't have the library set up
        reject(new Error('Native voice recognition library not configured'));
        
      } catch (error) {
        console.error('❌ Native voice recognition error:', error);
        reject(error);
      }
    });
  }, [onResult, showToast]);

  // Web Speech Recognition (Web only)
  const startWebSpeechRecognition = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      if (Platform.OS !== 'web') {
        reject(new Error('Web Speech API only available on web'));
        return;
      }

      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Web Speech Recognition not supported'));
        return;
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('🎤 Web speech recognition started');
        if (showToast) {
          showToast('🎤 Listening... (Speak now)', 'center');
        }
        resolve();
      };
      
      recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript.trim();
          console.log('🔊 Web speech recognized:', transcript);
          
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
        console.error('❌ Web speech recognition error:', event.error);
        let errorMessage = 'Voice recognition failed';
        
        switch (event.error) {
          case 'network':
            errorMessage = 'Network error - check your internet connection';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected - please try speaking louder';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not working - check your device';
            break;
          case 'service-not-allowed':
            errorMessage = 'Voice service not available';
            break;
          default:
            errorMessage = `Voice error: ${event.error}`;
        }
        
        setError(errorMessage);
        setIsListening(false);
        if (showToast) {
          showToast(`❌ ${errorMessage}`, 'center');
        }
        reject(new Error(errorMessage));
      };
      
      recognition.onend = () => {
        console.log('🔚 Web speech recognition ended');
        setIsListening(false);
      };
      
      // Auto-stop after 10 seconds
      timeoutRef.current = setTimeout(() => {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {}
        }
      }, 10000);
      
      try {
        recognition.start();
      } catch (error) {
        reject(error);
      }
    });
  }, [onResult, showToast]);

  const startListening = useCallback(async () => {
    try {
      console.log('🚀 Starting voice search on', Platform.OS);
      console.log('Native voice available:', nativeVoiceAvailable.current);
      
      if (!isSupported) {
        if (showToast) {
          showToast('❌ Voice search not supported on this platform', 'center');
        }
        return;
      }

      setError(null);
      setIsListening(true);
      
      // Platform-specific haptic feedback
      if (Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
          console.log('Haptics not available');
        }
      }
      
      let nativeAttempted = false;
      let webSpeechAttempted = false;
      
      // Priority 1: Try native speech recognition (React Native only)
      if (Platform.OS !== 'web' && nativeVoiceAvailable.current) {
        try {
          console.log('🎯 Attempting native voice recognition');
          await startNativeVoiceRecognition();
          nativeAttempted = true;
          return; // Success, exit early
        } catch (nativeError) {
          console.log('⚠️ Native voice recognition failed:', nativeError);
          nativeAttempted = true;
        }
      }
      
      // Priority 2: Try Web Speech Recognition (Web only)
      if (Platform.OS === 'web') {
        try {
          console.log('🎯 Attempting web speech recognition');
          await startWebSpeechRecognition();
          webSpeechAttempted = true;
          return; // Success, exit early
        } catch (webSpeechError) {
          console.log('⚠️ Web speech recognition failed:', webSpeechError);
          webSpeechAttempted = true;
        }
      }
      
      // Priority 3: Fallback to MediaRecorder + STT API
      console.log('🎯 Falling back to MediaRecorder + STT API');
      if (showToast && (nativeAttempted || webSpeechAttempted)) {
        showToast('ℹ️ Using fallback voice recognition', 'center');
      }
      await startMediaRecording();
      
    } catch (err) {
      console.error('❌ Voice recognition error:', err);
      setError('Failed to start voice recognition');
      setIsListening(false);
      if (showToast) {
        showToast('❌ Voice search failed to start', 'center');
      }
    }
  }, [isSupported, startNativeVoiceRecognition, startWebSpeechRecognition]);
  
  const startMediaRecording = useCallback(async () => {
    try {
      console.log('🎙️ Starting MediaRecorder fallback on', Platform.OS);
      
      // Request microphone permission for recording
      const hasPermission = await requestMicrophonePermission();
      if (!hasPermission) {
        setIsListening(false);
        return;
      }

      let stream = streamRef.current;
      if (!stream) {
        throw new Error('No audio stream available after permission grant');
      }
      
      // Platform-specific MIME type selection
      let mimeType = 'audio/webm;codecs=opus';
      
      if (Platform.OS === 'ios') {
        const iosFormats = ['audio/mp4', 'audio/aac', 'audio/webm;codecs=opus', 'audio/webm'];
        mimeType = iosFormats.find(format => MediaRecorder.isTypeSupported(format)) || 'audio/mp4';
      } else if (Platform.OS === 'android') {
        const androidFormats = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/3gpp'];
        mimeType = androidFormats.find(format => MediaRecorder.isTypeSupported(format)) || 'audio/webm';
      } else {
        const webFormats = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav'];
        mimeType = webFormats.find(format => MediaRecorder.isTypeSupported(format)) || 'audio/webm';
      }
      
      console.log('📹 Using MIME type:', mimeType, 'on', Platform.OS);
      
      const mediaRecorder = new MediaRecorder(stream, { 
        mimeType,
        ...(Platform.OS !== 'web' ? {
          audioBitsPerSecond: 64000
        } : {})
      });
      mediaRecorderRef.current = mediaRecorder;
      
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: mimeType });
        console.log('📁 Audio blob size:', audioBlob.size, 'bytes');
        
        if (audioBlob.size === 0) {
          if (showToast) {
            showToast('❌ No audio recorded', 'center');
          }
          setIsListening(false);
          return;
        }
        
        try {
          const formData = new FormData();
          const fileExtension = mimeType.includes('webm') ? 'webm' : 
                               mimeType.includes('mp4') ? 'm4a' :
                               mimeType.includes('3gpp') ? '3gp' : 'wav';
          formData.append('audio', audioBlob, `recording.${fileExtension}`);
          
          const timeout = Platform.OS === 'web' ? 30000 : 45000;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          if (showToast) {
            showToast('🔄 Processing voice...', 'center');
          }
          
          const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
            method: 'POST',
            body: formData,
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const result = await response.json();
            
            if (result.text && result.text.trim()) {
              onResult(result.text.trim());
              
              if (showToast) {
                showToast(`✅ Heard: "${result.text.trim()}"`, 'center');
              }
              
              if (Platform.OS !== 'web') {
                try {
                  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                } catch (e) {}
              }
            } else {
              if (showToast) {
                showToast('🔇 No speech detected', 'center');
              }
            }
          } else {
            throw new Error(`STT API failed: ${response.status}`);
          }
        } catch (error: any) {
          console.error('❌ STT processing error:', error);
          
          let errorMsg = 'Voice processing failed';
          if (error.name === 'AbortError') {
            errorMsg = 'Voice processing timed out';
          }
          
          setError(errorMsg);
          if (showToast) {
            showToast(`❌ ${errorMsg}`, 'center');
          }
        }
        
        setIsListening(false);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
      
      mediaRecorder.onstart = () => {
        if (showToast) {
          showToast('🎤 Recording... (STT fallback)', 'center');
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
        setError('Recording failed');
        setIsListening(false);
        
        if (showToast) {
          showToast('❌ Recording failed', 'center');
        }
      };
      
      const timeslice = Platform.OS === 'web' ? 500 : 1000;
      mediaRecorder.start(timeslice);
      
      const maxDuration = Platform.OS === 'web' ? 10000 : 15000;
      timeoutRef.current = setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, maxDuration);
      
    } catch (error) {
      console.error('❌ Media recording error:', error);
      setError('Recording setup failed');
      setIsListening(false);
      
      if (showToast) {
        showToast('❌ Could not start recording', 'center');
      }
    }
  }, [onResult, showToast, requestMicrophonePermission]);

  const stopListening = useCallback(async () => {
    if (isListening) {
      console.log('🛑 Stopping voice search on', Platform.OS);
      setIsListening(false);
      
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Platform-specific haptic feedback
      if (Platform.OS !== 'web') {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } catch (e) {}
      }
      
      // Stop native voice recognition (React Native)
      if (Platform.OS !== 'web' && nativeVoiceAvailable.current) {
        try {
          // Uncomment if using @react-native-voice/voice:
          /*
          const Voice = require('@react-native-voice/voice');
          await Voice.stop();
          */
        } catch (error) {
          console.log('Error stopping native voice recognition:', error);
        }
      }
      
      // Stop web speech recognition
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Error stopping web speech recognition:', error);
        }
        recognitionRef.current = null;
      }
      
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try {
          mediaRecorderRef.current.stop();
        } catch (error) {
          console.log('Error stopping media recorder:', error);
        }
      }
      
      // Clean up stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      if (showToast) {
        showToast('🔇 Voice search stopped', 'center');
      }
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
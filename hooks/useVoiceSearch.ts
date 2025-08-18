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
  showToast?: (message: string, type?: 'success' | 'error' | 'info', position?: 'top' | 'center' | 'bottom') => void
): VoiceSearchState {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

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
            showToast('🎤 Listening... (Speak now)', 'info', 'center');
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
                showToast(`✅ Heard: "${transcript}"`, 'success', 'center');
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
            showToast('❌ Voice recognition failed', 'error', 'center');
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
      let resultReceived = false;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;
      
      recognition.onstart = () => {
        console.log('🎤 Web speech recognition started');
        if (showToast) {
          showToast('🎤 Listening... (Speak now)', 'info', 'center');
        }
        resolve();
      };
      
      recognition.onresult = (event: any) => {
        resultReceived = true;
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript.trim();
          console.log('🔊 Web speech recognized:', transcript);
          
          if (transcript) {
            onResult(transcript);
            if (showToast) {
              showToast(`✅ Heard: "${transcript}"`, 'success', 'center');
            }
          }
        }
        setIsListening(false);
      };
      
      recognition.onerror = (event: any) => {
        console.error('❌ Web speech recognition error:', JSON.stringify(event.error, null, 2));
        let errorMessage = `Voice recognition failed: ${event.error}`;
        
        switch (event.error) {
          case 'network':
            errorMessage = 'Network error. Please check your internet connection or try again later.';
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
          showToast(`❌ ${errorMessage}`, 'error', 'center');
        }
        reject(new Error(errorMessage));
      };
      
      recognition.onend = () => {
        console.log('🔚 Web speech recognition ended');
        if (!resultReceived) {
          console.log('No result received before end event.');
        }
        setIsListening(false);
      };

      recognition.onospeech = () => {
        console.log('🔇 No speech detected');
        showToast?.('🔇 No speech detected, please try again.', 'info', 'center');
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
          showToast('❌ Voice search not supported on this platform', 'error', 'center');
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
      
      // If Web Speech API fails, we don't fall back to STT as per user request.
      // The error is already handled and shown to the user inside startWebSpeechRecognition.
    } catch (err) {
      console.error('❌ Voice recognition error:', err);
      setError('Failed to start voice recognition');
      setIsListening(false);
      if (showToast) {
        showToast('❌ Voice search failed to start', 'error', 'center');
      }
    }
  }, [isSupported, startNativeVoiceRecognition, startWebSpeechRecognition]);

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
        showToast('🔇 Voice search stopped', 'info', 'center');
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
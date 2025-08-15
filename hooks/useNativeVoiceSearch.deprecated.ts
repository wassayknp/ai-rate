import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';

type VoiceSearchState = {
  isListening: boolean;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
};

export default function useNativeVoiceSearch(
  onResult: (text: string) => void,
  showToast?: (message: string, type?: 'success' | 'error' | 'info', position?: 'top' | 'center' | 'bottom') => void
): VoiceSearchState {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      showToast?.('🎤 Listening...', 'info', 'center');
    };

    Voice.onSpeechResults = (e) => {
      const transcript = e.value?.[0];
      if (transcript) {
        onResult(transcript);
        showToast?.(`🔊 "${transcript}"`, 'success', 'center');
      }
      stopListening();
    };

    Voice.onSpeechError = (e) => {
      const msg = e.error?.message || 'Voice recognition failed';
      setError(msg);
      showToast?.(`❌ ${msg}`, 'error', 'center');
      stopListening();
    };

    return () => {
      Voice.removeAllListeners();
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      if (!Voice) {
        showToast?.('❌ The native voice module is not available. This is expected in Expo Go. Please use a development build to test this feature.', 'error', 'center');
        return;
      }
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        showToast?.('❌🎙️ The voice recognition service is not available on this device.', 'error', 'center');
        return;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast?.('🎤🚫 Microphone access is required to use voice search.', 'error', 'center');
        return;
      }

      await Voice.start('en-IN'); // or 'hi-IN' or 'ar-SA'
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.error('Start error:', e);
      showToast?.('🎤⚠️ Failed to start voice recognition.', 'error', 'center');
    }
  }, []);

  const stopListening = useCallback(async () => {
    try {
      await Voice.stop();
      setIsListening(false);
    } catch (e) {
      console.error('Stop error:', e);
    }
  }, []);

  return {
    isListening,
    error,
    isSupported: true, // Native is always supported if the hook is used
    startListening,
    stopListening,
  };
}

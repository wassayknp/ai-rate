import Voice from '@react-native-voice/voice';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

type VoiceSearchState = {
  isListening: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
};

export default function useNativeVoiceSearch(
  onResult: (text: string) => void,
  showToast?: (message: string, position?: 'top' | 'center' | 'bottom') => void
): VoiceSearchState {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Voice.onSpeechStart = () => {
      setIsListening(true);
      showToast?.('🎤 Listening...', 'center');
    };

    Voice.onSpeechResults = (e) => {
      const transcript = e.value?.[0];
      if (transcript) {
        onResult(transcript);
        showToast?.(`🔊 "${transcript}"`, 'center');
      }
      stopListening();
    };

    Voice.onSpeechError = (e) => {
      const msg = e.error?.message || 'Voice recognition failed';
      setError(msg);
      showToast?.(`❌ ${msg}`, 'center');
      stopListening();
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const startListening = useCallback(async () => {
    try {
      await Voice.start('en-IN'); // or 'hi-IN' or 'ar-SA'
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      console.error('Start error:', e);
      Alert.alert('Mic Error', 'Failed to start voice recognition.');
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

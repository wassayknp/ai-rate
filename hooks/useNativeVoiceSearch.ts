import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';

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
        Alert.alert(
          'Voice Module Not Linked',
          'The native voice module is not available. This is expected in Expo Go. Please use a development build to test this feature.'
        );
        return;
      }

      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        Alert.alert(
          'Voice Search Not Available',
          'The voice recognition service is not available on this device or in your current environment.'
        );
        return;
      }

      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'You need to grant microphone access to use voice search.');
        return;
      }

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

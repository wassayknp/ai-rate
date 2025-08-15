// hooks/useVoiceSearch.ts
import Voice from '@react-native-voice/voice';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useCallback, useEffect, useState } from 'react';

type VoiceSearchState = {
  isListening: boolean;
  error: string | null;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
};

export default function useVoiceSearch(
  onResult: (text: string) => void,
  showToast?: (
    message: string,
    type?: 'success' | 'error' | 'info',
    position?: 'top' | 'center' | 'bottom'
  ) => void
): VoiceSearchState {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ✅ Only native is "supported" for real voice
  const isSupported = Platform.OS !== 'web';

  useEffect(() => {
    // Set up voice event listeners
    Voice.onSpeechStart = (e) => {
      setIsListening(true);
      showToast?.('🎤 Listening...', 'info', 'center');
    };

    Voice.onSpeechResults = (e) => {
      const transcript = e.value?.[0];
      if (transcript) {
        onResult(transcript);
        showToast?.(`🔊 "${transcript}"`, 'success', 'center');
      }
      setIsListening(false);
    };

    Voice.onSpeechError = (e) => {
      const errorMsg = e.error?.message || 'Voice recognition failed';
      setError(errorMsg);
      showToast?.(`❌ ${errorMsg}`, 'error', 'center');
      setIsListening(false);
    };

    Voice.onSpeechEnd = () => {
      setIsListening(false);
    };

    // Cleanup
    return () => {
      Voice.destroy().catch(console.warn);
    };
  }, [onResult, showToast]);

  const startListening = useCallback(async () => {
    try {
      if (Platform.OS === 'web') {
        // ❌ Web not supported
        const msg = '🎙️ Voice search not available on web';
        showToast?.(msg, 'info', 'center');
        console.log(msg);
        return;
      }

      // ✅ Android & iOS
      const isAvailable = await Voice.isAvailable();
      if (!isAvailable) {
        showToast?.('❌ Voice not available on this device', 'error', 'center');
        return;
      }

      await Voice.start('en-IN');
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (err: any) {
      console.error('Voice start error:', err);
      const errorMsg = err.message || 'Failed to start voice';
      setError(errorMsg);
      showToast?.(`❌ ${errorMsg}`, 'error', 'center');
      setIsListening(false);
    }
  }, [showToast]);

  const stopListening = useCallback(async () => {
    try {
      if (Platform.OS !== 'web') {
        await Voice.stop();
      }
      setIsListening(false);
    } catch (err) {
      console.error('Stop error:', err);
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    error,
    isSupported,
    startListening,
    stopListening,
  };
}
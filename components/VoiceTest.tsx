import useVoiceSearchDebug from '@/hooks/useVoiceSearchDebug'; // Use the debug version above
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const VoiceSearchTest = () => {
  const [searchText, setSearchText] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (message: string, position?: 'top' | 'center' | 'bottom') => {
    console.log('🍞 Toast:', message);
    setToastMessage(message);
    // Clear toast after 3 seconds
    setTimeout(() => setToastMessage(''), 3000);
  };

  const { isListening, error, isSupported, startListening, stopListening } = useVoiceSearchDebug(
    (text: string) => {
      console.log('🔊 Voice search result received:', text);
      setSearchText(text);
    },
    showToast
  );

  const handleVoicePress = async () => {
    console.log('🎤 Voice button pressed');
    console.log('Current isListening state:', isListening);
    
    try {
      if (isListening) {
        console.log('Stopping voice search...');
        await stopListening();
      } else {
        console.log('Starting voice search...');
        await startListening();
      }
    } catch (err) {
      console.error('Voice press error:', err);
      Alert.alert('Voice Search Error', String(err));
    }
  };

  const testMicrophoneAccess = async () => {
    console.log('🧪 Testing microphone access...');
    
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        Alert.alert('Test Result', 'MediaDevices API not available');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone test successful');
      Alert.alert('Test Result', '✅ Microphone access successful!');
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('❌ Microphone test failed:', error);
      Alert.alert('Test Result', `❌ Microphone test failed: ${error}`);
    }
  };

  const testWebSpeech = () => {
    console.log('🧪 Testing Web Speech Recognition...');
    
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    
    if (SpeechRecognition) {
      Alert.alert('Test Result', '✅ Web Speech Recognition available!');
    } else {
      Alert.alert('Test Result', '❌ Web Speech Recognition not available');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voice Search Debug Test</Text>
      
      {/* Status Display */}
      <View style={styles.statusContainer}>
        <Text style={styles.label}>Supported: {isSupported ? '✅' : '❌'}</Text>
        <Text style={styles.label}>Listening: {isListening ? '🎤' : '🔇'}</Text>
        <Text style={styles.label}>Error: {error || 'None'}</Text>
      </View>

      {/* Search Result */}
      <View style={styles.resultContainer}>
        <Text style={styles.label}>Last Result:</Text>
        <Text style={styles.result}>{searchText || 'No result yet'}</Text>
      </View>

      {/* Toast Message */}
      {toastMessage ? (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      {/* Main Voice Button */}
      <TouchableOpacity
        style={[
          styles.voiceButton,
          { backgroundColor: isListening ? '#ff4444' : '#4CAF50' }
        ]}
        onPress={handleVoicePress}
      >
        <Text style={styles.buttonText}>
          {isListening ? '🛑 Stop Listening' : '🎤 Start Voice Search'}
        </Text>
      </TouchableOpacity>

      {/* Test Buttons */}
      <View style={styles.testContainer}>
        <TouchableOpacity style={styles.testButton} onPress={testMicrophoneAccess}>
          <Text style={styles.testButtonText}>🧪 Test Microphone</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.testButton} onPress={testWebSpeech}>
          <Text style={styles.testButtonText}>🧪 Test Web Speech</Text>
        </TouchableOpacity>
      </View>

      {/* Debug Info */}
      <View style={styles.debugContainer}>
        <Text style={styles.debugTitle}>Debug Info:</Text>
        <Text style={styles.debugText}>Platform: {require('react-native').Platform.OS}</Text>
        <Text style={styles.debugText}>
          MediaDevices: {navigator?.mediaDevices ? '✅' : '❌'}
        </Text>
        <Text style={styles.debugText}>
          getUserMedia: {typeof navigator?.mediaDevices?.getUserMedia === 'function' ? '✅' : '❌'}
        </Text>
        <Text style={styles.debugText}>
          MediaRecorder: {typeof MediaRecorder !== 'undefined' ? '✅' : '❌'}
        </Text>
        {typeof window !== 'undefined' && (
          <>
            <Text style={styles.debugText}>
              Web Speech: {((window as any).webkitSpeechRecognition || (window as any).SpeechRecognition) ? '✅' : '❌'}
            </Text>
            <Text style={styles.debugText}>
              HTTPS: {window.location.protocol === 'https:' ? '✅' : '❌'}
            </Text>
            <Text style={styles.debugText}>
              Localhost: {window.location.hostname === 'localhost' ? '✅' : '❌'}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  result: {
    fontSize: 14,
    color: '#333',
    fontStyle: 'italic',
  },
  toastContainer: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 15,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
  },
  voiceButton: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  testContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    flex: 0.48,
  },
  testButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  debugContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  debugTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  debugText: {
    fontSize: 14,
    marginBottom: 3,
    fontFamily: 'monospace',
  },
});

export default VoiceSearchTest;
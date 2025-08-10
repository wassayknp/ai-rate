import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

export default function BottomFooter() {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);

  const openGitHub = () => {
    Linking.openURL('https://github.com/wassayknp');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <TouchableOpacity onPress={openGitHub} style={styles.content}>
        <Text style={[styles.text, { color: colors.text }]}>
          AI Rate List created in 🇮🇳 by{' '}
          <Text style={[styles.link, { color: colors.primary }]}>wassayknp</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  content: {
    alignItems: 'center',
  },
  text: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  link: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
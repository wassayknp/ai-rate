import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

type BottomFooterProps = {
  onPressAdmin: () => void;
  onPressHelp: () => void;
};

export default function BottomFooter({ onPressAdmin, onPressHelp }: BottomFooterProps) {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <TouchableOpacity onPress={onPressAdmin} style={styles.button}>
        <Ionicons name="settings-outline" size={16} color={colors.text} />
        <Text style={[styles.text, { color: colors.text }]}>Admin Settings</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressHelp} style={styles.button}>
        <Text style={[styles.text, { color: colors.text }]}>Need Help?</Text>
        <Ionicons name="help-circle-outline" size={16} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});
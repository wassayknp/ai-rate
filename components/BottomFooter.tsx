import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Image, Linking } from 'react-native';
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
 const openGitHub = () => {
    Linking.openURL('https://github.com/wassayknp');
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
      <TouchableOpacity onPress={onPressAdmin} style={styles.button}>
        <Ionicons name="settings-outline" size={16} color={colors.text} />
        <Text style={[styles.text, { color: colors.text }]}>Admin</Text>
      </TouchableOpacity>
            <TouchableOpacity onPress={openGitHub} style={styles.content}>
        <Text style={[styles.text, { color: colors.text }]}>
          <Image source={{ uri: './assets/images/icon.png' }} style={styles.companylogo} /> AI Rate List <Ionicons name="heart" size={12} color="#FF6B6B" /> in 🇮🇳 
                          
          {/* <Text style={[styles.link, { color: colors.primary }]}>wassayknp</Text> */}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressHelp} style={styles.button}>
        <Text style={[styles.text, { color: colors.text }]}>Help</Text>
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
    companylogo: {
    width: 15,
    height: 15,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  link: {
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
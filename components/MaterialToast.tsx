import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { useThemeColors } from '@/constants/colors';
import { useTheme } from '@/contexts/ThemeContext';

type ToastPosition = 'top' | 'center' | 'bottom';

type MaterialToastProps = {
  message: string;
  visible: boolean;
  duration?: number;
  position?: ToastPosition;
  type?: 'success' | 'error' | 'info';
  icon?: React.ReactNode;
  onHide?: () => void;
};

export default function MaterialToast({
  message,
  visible,
  duration = 2000,
  position = 'bottom',
  type = 'info',
  icon,
  onHide
}: MaterialToastProps) {
  const { isDarkMode } = useTheme();
  const colors = useThemeColors(isDarkMode);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [translateY] = useState(new Animated.Value(50));
  
  const { height } = Dimensions.get('window');
  
  // Determine toast color based on type
  const getToastColor = () => {
    switch (type) {
      case 'success':
        return '#4CAF50'; // Green
      case 'error':
        return '#F44336'; // Red
      case 'info':
      default:
        return '#2196F3'; // Blue
    }
  };

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 50,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          onHide?.();
        });
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, fadeAnim, translateY, onHide]);

  if (!visible) return null;

  const getPositionStyle = () => {
    switch (position) {
      case 'top':
        return { top: 60 };
      case 'center':
        return { top: height / 2 - 30 };
      case 'bottom':
      default:
        return { bottom: 100 };
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getToastColor(),
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
        getPositionStyle(),
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    color: '#FFFFFF',
  },
});
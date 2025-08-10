import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RatingIconProps = {
  rating: number;
  size?: number;
  color?: string;
};

export default function RatingIcon({ rating, size = 16, color = '#FFD700' }: RatingIconProps) {
  const getIconName = (rating: number): keyof typeof Ionicons.glyphMap => {
    if (rating >= 4.5) {
      return 'trophy'; // Trophy for highest ratings
    } else if (rating >= 4.0) {
      return 'sparkles'; // Sparkles for very good
    } else if (rating >= 3.0) {
      return 'star'; // Full star for good
    } else if (rating >= 2.0) {
      return 'star-half'; // Half star for average
    } else if (rating >= 1.0) {
      return 'moon'; // Moon for low ratings
    } else {
      return 'remove-circle-outline'; // Empty for no rating
    }
  };

  const getIconColor = (rating: number): string => {
    if (rating >= 4.5) {
      return '#FFD700'; // Gold for crown
    } else if (rating >= 4.0) {
      return '#FF6B6B'; // Red for sparkles
    } else if (rating >= 3.0) {
      return '#4ECDC4'; // Teal for star
    } else if (rating >= 2.0) {
      return '#45B7D1'; // Blue for half star
    } else if (rating >= 1.0) {
      return '#96CEB4'; // Green for moon
    } else {
      return '#BDC3C7'; // Gray for no rating
    }
  };

  const getIconSize = (rating: number): number => {
    if (rating >= 4.5) {
      return size + 4; // Larger for crown
    } else if (rating >= 4.0) {
      return size + 2; // Slightly larger for sparkles
    } else {
      return size; // Normal size for others
    }
  };

  const iconName = getIconName(rating);
  const iconColor = color || getIconColor(rating);
  const iconSize = getIconSize(rating);

  return (
    <View style={styles.container}>
      <Ionicons 
        name={iconName} 
        size={iconSize} 
        color={iconColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
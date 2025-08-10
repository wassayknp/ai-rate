import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import colors from '@/constants/colors';

type StockToggleProps = {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

export default function StockToggle({ 
  value, 
  onValueChange
}: StockToggleProps) {
  return (
    <View style={styles.container} testID="stock-toggle">
      <Text style={styles.label}>Show in-stock only</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.inactive, true: colors.primary }}
        thumbColor={colors.card}
        testID="stock-toggle-switch"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  label: {
    fontSize: 14,
    color: colors.text,
  },
});
import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from './theme';

export interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'orange';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'neutral',
  style,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: Colors.greenLight, text: Colors.greenDark };
      case 'warning':
        return { bg: Colors.yellowLight, text: '#B45309' };
      case 'danger':
        return { bg: Colors.redLight, text: Colors.red };
      case 'info':
        return { bg: '#DBEAFE', text: Colors.blue };
      case 'orange':
        return { bg: Colors.orangeLight, text: Colors.orangeDark };
      case 'neutral':
      default:
        return { bg: Colors.divider, text: Colors.textSecondary };
    }
  };

  const c = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }, style]}>
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.round,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
});

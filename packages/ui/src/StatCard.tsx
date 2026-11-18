import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, Shadows } from './theme';

export interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  accentColor?: string;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  accentColor = Colors.orange,
  icon,
  style,
}) => {
  return (
    <View style={[styles.container, Shadows.sm, style]}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        {icon}
      </View>
      <Text style={[styles.value, { color: accentColor }]}>{value}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    minWidth: 140,
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 2,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '500',
  },
});

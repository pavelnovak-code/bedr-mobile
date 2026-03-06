import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { radius, spacing, shadows } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | (ViewStyle | false | undefined)[];
  padded?: boolean;
  variant?: 'default' | 'accent' | 'elevated';
  accentColor?: string;
}

export default function Card({
  children,
  style,
  padded = true,
  variant = 'default',
  accentColor,
}: CardProps) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card },
        variant === 'elevated' && shadows.md,
        variant === 'accent' && {
          borderLeftWidth: 3,
          borderLeftColor: accentColor || colors.primary,
        },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    ...shadows.sm,
  },
  padded: {
    padding: spacing.lg,
  },
});

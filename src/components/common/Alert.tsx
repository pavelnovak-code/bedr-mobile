import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, fonts, radius, spacing } from '../../config/theme';

interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  visible?: boolean;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

const BG_MAP = {
  error:   { bg: '#fef2f2', border: colors.danger, text: colors.danger },
  success: { bg: '#f0fdf4', border: colors.success, text: colors.success },
  warning: { bg: '#fffbeb', border: colors.warning, text: '#92400e' },
  info:    { bg: colors.primaryLight, border: colors.primary, text: colors.primary },
};

export default function Alert({
  message,
  type = 'error',
  visible = true,
  onDismiss,
  autoDismissMs = 5000,
}: AlertProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const theme = BG_MAP[type];

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      if (onDismiss && autoDismissMs > 0) {
        const t = setTimeout(onDismiss, autoDismissMs);
        return () => clearTimeout(t);
      }
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [visible]);

  if (!visible || !message) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.bg, borderLeftColor: theme.border, opacity },
      ]}
    >
      <Text style={[styles.text, { color: theme.text }]}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 4,
    borderRadius: radius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
});

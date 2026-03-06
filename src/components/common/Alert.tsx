import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { fonts, radius, spacing } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface AlertProps {
  message: string;
  type?: 'error' | 'success' | 'warning' | 'info';
  visible?: boolean;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export default function Alert({
  message,
  type = 'error',
  visible = true,
  onDismiss,
  autoDismissMs = 5000,
}: AlertProps) {
  const { colors, isDark } = useTheme();
  const opacity = useRef(new Animated.Value(0)).current;

  const BG_MAP = {
    error:   {
      bg: isDark ? 'rgba(239,68,68,0.15)' : '#fef2f2',
      border: colors.danger,
      text: isDark ? '#fca5a5' : colors.danger,
    },
    success: {
      bg: isDark ? 'rgba(34,197,94,0.15)' : '#f0fdf4',
      border: colors.success,
      text: isDark ? '#86efac' : colors.success,
    },
    warning: {
      bg: isDark ? 'rgba(217,119,6,0.15)' : '#fffbeb',
      border: colors.warning,
      text: isDark ? '#fcd34d' : '#92400e',
    },
    info:    {
      bg: isDark ? 'rgba(0,155,203,0.15)' : colors.primaryLight,
      border: colors.primary,
      text: colors.primary,
    },
  };

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

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { fonts, spacing } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface SpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullScreen?: boolean;
}

export default function Spinner({ message, size = 'large', fullScreen = false }: SpinnerProps) {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, fullScreen && [styles.fullScreen, { backgroundColor: colors.bg }]]}>
      <ActivityIndicator size={size} color={colors.primary} />
      {message && <Text style={[styles.text, { color: colors.muted }]}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  fullScreen: {
    flex: 1,
  },
  text: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginTop: spacing.md,
  },
});

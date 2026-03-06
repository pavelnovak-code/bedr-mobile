import React, { useRef } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { fonts, radius, spacing } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  };

  // Dynamic bg / text per variant
  const variantStyles: Record<string, { bg: string; borderColor?: string; textColor: string }> = {
    primary:   { bg: colors.primary, textColor: colors.white },
    secondary: { bg: colors.primaryLight, textColor: colors.primary },
    outline:   { bg: 'transparent', borderColor: colors.primary, textColor: colors.primary },
    danger:    { bg: colors.danger, textColor: colors.white },
    ghost:     { bg: 'transparent', textColor: colors.primary },
  };

  const sizeStyles: Record<string, { pv: number; ph: number; minH: number; fs: number }> = {
    sm: { pv: spacing.sm, ph: spacing.md, minH: 36, fs: 13 },
    md: { pv: spacing.md, ph: spacing.lg, minH: 44, fs: 15 },
    lg: { pv: spacing.lg, ph: spacing.xl, minH: 52, fs: 17 },
  };

  const v = variantStyles[variant];
  const s = sizeStyles[size];

  return (
    <Animated.View style={[{ transform: [{ scale }] }, fullWidth && styles.fullWidth, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        style={[
          styles.base,
          {
            backgroundColor: v.bg,
            paddingVertical: s.pv,
            paddingHorizontal: s.ph,
            minHeight: s.minH,
          },
          v.borderColor ? { borderWidth: 1.5, borderColor: v.borderColor } : undefined,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'outline' || variant === 'ghost' ? colors.primary : colors.white}
          />
        ) : (
          <>
            {icon}
            <Text style={[styles.text, { color: v.textColor, fontSize: s.fs }, textStyle]}>
              {title}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    gap: spacing.sm,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: fonts.semiBold,
  },
});

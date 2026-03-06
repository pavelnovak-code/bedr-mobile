import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fonts, radius, spacing } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  rightIcon?: React.ReactNode;
  isPassword?: boolean;
}

export default function Input({
  label,
  error,
  rightIcon,
  isPassword,
  style,
  ...rest
}: InputProps) {
  const { colors } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrap,
          {
            borderColor: error
              ? colors.danger
              : isFocused
                ? colors.primary
                : colors.border,
            backgroundColor: isFocused ? colors.primaryLight : colors.card,
            borderWidth: isFocused ? 2 : 1.5,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.muted}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          onFocus={(e) => {
            setIsFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            rest.onBlur?.(e);
          }}
          {...rest}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.muted}
            />
          </TouchableOpacity>
        )}
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>
      {error && <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
  },
  label: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: spacing.xs,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
  },
  input: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  eyeBtn: {
    paddingHorizontal: spacing.md,
  },
  rightIcon: {
    paddingRight: spacing.md,
  },
  errorText: {
    fontFamily: fonts.regular,
    fontSize: 12,
    marginTop: spacing.xs,
  },
});

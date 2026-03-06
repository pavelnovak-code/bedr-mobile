import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { fonts, spacing, radius, gradients } from '../../config/theme';

type ButtonSize = 'sm' | 'md' | 'lg';

interface GradientButtonProps {
  title: string;
  onPress: () => void;
  gradientColors?: readonly [string, string, ...string[]] | string[];
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: ButtonSize;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const sizeHeights: Record<ButtonSize, number> = {
  sm: 36,
  md: 48,
  lg: 56,
};

const sizeFontSizes: Record<ButtonSize, number> = {
  sm: 13,
  md: 15,
  lg: 17,
};

export default function GradientButton({
  title,
  onPress,
  gradientColors = gradients.energy,
  loading = false,
  disabled = false,
  fullWidth = false,
  size = 'md',
  style,
  textStyle,
}: GradientButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const height = sizeHeights[size];
  const fontSize = sizeFontSizes[size];
  const isDisabled = disabled || loading;

  return (
    <Animated.View
      style={[
        { transform: [{ scale }], opacity: isDisabled ? 0.5 : 1 },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
      >
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[
            styles.gradient,
            {
              height,
              paddingHorizontal: size === 'sm' ? spacing.lg : spacing.xl,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <Animated.Text
              style={[
                styles.text,
                { fontSize },
                textStyle,
              ]}
            >
              {title}
            </Animated.Text>
          )}
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  gradient: {
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    color: '#ffffff',
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
});

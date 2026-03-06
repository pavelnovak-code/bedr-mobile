import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { fonts, spacing } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  children: React.ReactNode;
  /** Akce při swipe doleva (pravá strana se odkryje) */
  onSwipeRight?: () => void;
  rightLabel?: string;
  rightColor?: string;
  /** Akce při swipe doprava (levá strana se odkryje) */
  onSwipeLeft?: () => void;
  leftLabel?: string;
  leftColor?: string;
  // Zpětná kompatibilita
  onSwipeAction?: () => void;
  actionLabel?: string;
  actionColor?: string;
}

export default function SwipeableRow({
  children,
  onSwipeRight,
  rightLabel = 'Zrušit',
  rightColor,
  onSwipeLeft,
  leftLabel = 'Přesunout',
  leftColor,
  // Zpětná kompatibilita
  onSwipeAction,
  actionLabel,
  actionColor,
}: Props) {
  const { colors } = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  // Resolve colors with defaults from theme
  const rColor = actionColor || rightColor || colors.danger;
  const lColor = leftColor || colors.primary;

  // Zpětná kompatibilita: onSwipeAction = onSwipeRight
  const handleRight = onSwipeRight || onSwipeAction;
  const rLabel = actionLabel || rightLabel;

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    if (!handleRight) return null;

    const scale = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.8, 0],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [1, 0.7, 0],
      extrapolate: 'clamp',
    });

    return (
      <RectButton
        style={[styles.actionBtn, { backgroundColor: rColor }]}
        onPress={() => {
          swipeableRef.current?.close();
          handleRight();
        }}
      >
        <Animated.Text style={[styles.actionText, { transform: [{ scale }], opacity }]}>
          {rLabel}
        </Animated.Text>
      </RectButton>
    );
  };

  const renderLeftActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
    if (!onSwipeLeft) return null;

    const scale = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });

    const opacity = dragX.interpolate({
      inputRange: [0, 50, 100],
      outputRange: [0, 0.7, 1],
      extrapolate: 'clamp',
    });

    return (
      <RectButton
        style={[styles.actionBtn, styles.actionBtnLeft, { backgroundColor: lColor }]}
        onPress={() => {
          swipeableRef.current?.close();
          onSwipeLeft();
        }}
      >
        <Animated.Text style={[styles.actionText, { transform: [{ scale }], opacity }]}>
          {leftLabel}
        </Animated.Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={handleRight ? renderRightActions : undefined}
      renderLeftActions={onSwipeLeft ? renderLeftActions : undefined}
      overshootRight={false}
      overshootLeft={false}
      friction={2}
      rightThreshold={40}
      leftThreshold={40}
    >
      {children}
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    borderRadius: 12,
    marginLeft: spacing.sm,
  },
  actionBtnLeft: {
    marginLeft: 0,
    marginRight: spacing.sm,
  },
  actionText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: '#ffffff',
  },
});

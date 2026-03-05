import React, { useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Swipeable, RectButton } from 'react-native-gesture-handler';
import { colors, fonts, spacing } from '../../config/theme';

interface Props {
  children: React.ReactNode;
  onSwipeAction: () => void;
  actionLabel?: string;
  actionColor?: string;
}

export default function SwipeableRow({
  children,
  onSwipeAction,
  actionLabel = 'Zrušit',
  actionColor = colors.danger,
}: Props) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    _progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>,
  ) => {
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
        style={[styles.actionBtn, { backgroundColor: actionColor }]}
        onPress={() => {
          swipeableRef.current?.close();
          onSwipeAction();
        }}
      >
        <Animated.Text style={[styles.actionText, { transform: [{ scale }], opacity }]}>
          {actionLabel}
        </Animated.Text>
      </RectButton>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
      friction={2}
      rightThreshold={40}
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
  actionText: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: colors.white,
  },
});

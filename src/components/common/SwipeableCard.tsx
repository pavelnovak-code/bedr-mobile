import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { colors, fonts, spacing, radius } from '../../config/theme';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;    // Zrušit
  onSwipeRight?: () => void;   // Přesunout
  leftLabel?: string;
  rightLabel?: string;
  leftColor?: string;
  rightColor?: string;
  style?: any;
  enabled?: boolean;
}

const SWIPE_THRESHOLD = 80;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftLabel = 'Zrušit',
  rightLabel = 'Přesunout',
  leftColor = colors.danger,
  rightColor = colors.warning,
  style,
  enabled = true,
}: SwipeableCardProps) {
  const translateX = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gs) =>
        enabled && Math.abs(gs.dx) > 10 && Math.abs(gs.dx) > Math.abs(gs.dy * 1.5),
      onPanResponderMove: (_, gs) => {
        translateX.setValue(gs.dx);
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx < -SWIPE_THRESHOLD && onSwipeLeft) {
          // Swipe doleva → Zrušit
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onSwipeLeft();
            translateX.setValue(0);
          });
        } else if (gs.dx > SWIPE_THRESHOLD && onSwipeRight) {
          // Swipe doprava → Přesunout
          Animated.timing(translateX, {
            toValue: SCREEN_WIDTH,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onSwipeRight();
            translateX.setValue(0);
          });
        } else {
          // Vrátit zpět
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  // Interpolace pro pozadí akcí
  const leftBgOpacity = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, -SWIPE_THRESHOLD, 0],
    outputRange: [1, 0.8, 0],
    extrapolate: 'clamp',
  });
  const rightBgOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD, SCREEN_WIDTH],
    outputRange: [0, 0.8, 1],
    extrapolate: 'clamp',
  });

  return (
    <View style={[styles.container, style]}>
      {/* Pozadí akce - doleva (červené) */}
      <Animated.View style={[styles.actionBg, styles.actionLeft, { backgroundColor: leftColor, opacity: leftBgOpacity }]}>
        <Text style={styles.actionText}>{leftLabel}</Text>
      </Animated.View>

      {/* Pozadí akce - doprava (oranžové) */}
      <Animated.View style={[styles.actionBg, styles.actionRight, { backgroundColor: rightColor, opacity: rightBgOpacity }]}>
        <Text style={styles.actionText}>{rightLabel}</Text>
      </Animated.View>

      {/* Obsah karty */}
      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radius.lg,
    marginBottom: spacing.md,
  },
  actionBg: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.xl,
  },
  actionLeft: {
    alignItems: 'flex-end',
  },
  actionRight: {
    alignItems: 'flex-start',
  },
  actionText: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.white,
    textTransform: 'uppercase',
  },
});

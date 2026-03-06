import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts, spacing, radius, shadows } from '../../config/theme';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_W - 80;
const SWIPE_DISTANCE = 120;

interface TutorialOverlayProps {
  visible: boolean;
  onDismiss: () => void;
  onNeverShow: () => void;
}

export default function TutorialOverlay({ visible, onDismiss, onNeverShow }: TutorialOverlayProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const cardTranslateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in overlay
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();

      // Demo animace karty: doprava → zpět → doleva → zpět → loop
      const demoLoop = Animated.loop(
        Animated.sequence([
          // Pauza na startu
          Animated.delay(500),
          // Slide doprava (přesunout)
          Animated.timing(cardTranslateX, {
            toValue: SWIPE_DISTANCE,
            duration: 500,
            useNativeDriver: true,
          }),
          // Zpět do středu
          Animated.spring(cardTranslateX, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
          // Pauza
          Animated.delay(800),
          // Slide doleva (zrušit)
          Animated.timing(cardTranslateX, {
            toValue: -SWIPE_DISTANCE,
            duration: 500,
            useNativeDriver: true,
          }),
          // Zpět do středu
          Animated.spring(cardTranslateX, {
            toValue: 0,
            tension: 80,
            friction: 10,
            useNativeDriver: true,
          }),
          // Pauza před loop
          Animated.delay(1000),
        ])
      );
      demoLoop.start();

      return () => {
        demoLoop.stop();
      };
    } else {
      fadeAnim.setValue(0);
      cardTranslateX.setValue(0);
    }
  }, [visible]);

  if (!visible) return null;

  // Interpolace pro reveal pozadí
  const cancelOpacity = cardTranslateX.interpolate({
    inputRange: [-SWIPE_DISTANCE, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const moveOpacity = cardTranslateX.interpolate({
    inputRange: [0, SWIPE_DISTANCE],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <SafeAreaView style={styles.safe}>
          {/* Horní část — headline */}
          <View style={styles.headerSection}>
            <Text style={styles.headline}>Swipe pro akce</Text>
            <Text style={styles.subheadline}>
              Přetáhněte kartu lekce doleva nebo doprava
            </Text>
          </View>

          {/* Střed — interaktivní demo */}
          <View style={styles.demoSection}>
            {/* Reveal pozadí za kartou */}
            <View style={styles.revealContainer}>
              {/* Levá strana — zrušit (červená) */}
              <Animated.View style={[styles.revealLeft, { opacity: cancelOpacity }]}>
                <Ionicons name="close-circle-outline" size={40} color="#ffffff" />
                <Text style={styles.revealLabel}>ZRUŠIT</Text>
              </Animated.View>

              {/* Pravá strana — přesunout (oranžová) */}
              <Animated.View style={[styles.revealRight, { opacity: moveOpacity }]}>
                <Ionicons name="calendar-outline" size={40} color="#ffffff" />
                <Text style={styles.revealLabel}>PŘESUNOUT</Text>
              </Animated.View>
            </View>

            {/* Animovaná fake karta */}
            <Animated.View
              style={[
                styles.fakeCard,
                { transform: [{ translateX: cardTranslateX }] },
              ]}
            >
              <View style={styles.fakeCardIcon}>
                <Ionicons name="fitness-outline" size={22} color="#006085" />
              </View>
              <View style={styles.fakeCardText}>
                <Text style={styles.fakeCardTitle}>Yoga · 18:00</Text>
                <Text style={styles.fakeCardSub}>Studio BEDR</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
            </Animated.View>
          </View>

          {/* Spodní část — CTA tlačítka */}
          <View style={styles.ctaSection}>
            <TouchableOpacity onPress={onDismiss} style={styles.primaryBtn} activeOpacity={0.85}>
              <Text style={styles.primaryBtnText}>Rozumím</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onNeverShow} style={styles.secondaryBtn} activeOpacity={0.7}>
              <Text style={styles.secondaryBtnText}>Už nezobrazovat</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.92)',
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
  },

  // ── Header ──────────────────────────────────────────
  headerSection: {
    alignItems: 'center',
    paddingTop: 60,
  },
  headline: {
    fontFamily: fonts.headingBold,
    fontSize: 28,
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subheadline: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },

  // ── Demo section ────────────────────────────────────
  demoSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealContainer: {
    width: CARD_WIDTH,
    height: 72,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  revealLeft: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ef4444',
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 24,
    gap: spacing.sm,
  },
  revealRight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#f59e0b',
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
    gap: spacing.sm,
  },
  revealLabel: {
    fontFamily: fonts.bold,
    fontSize: 12,
    color: '#ffffff',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Fake card
  fakeCard: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: 72,
    backgroundColor: '#ffffff',
    borderRadius: radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    ...shadows.md,
  },
  fakeCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f4fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  fakeCardText: {
    flex: 1,
  },
  fakeCardTitle: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: '#1f1e1e',
  },
  fakeCardSub: {
    fontFamily: fonts.regular,
    fontSize: 13,
    color: '#6b7a8d',
    marginTop: 2,
  },

  // ── CTA ─────────────────────────────────────────────
  ctaSection: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  primaryBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#ffffff',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtnText: {
    fontFamily: fonts.bold,
    fontSize: 16,
    color: '#0F172A',
  },
  secondaryBtn: {
    paddingVertical: spacing.lg,
  },
  secondaryBtnText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
  },
});

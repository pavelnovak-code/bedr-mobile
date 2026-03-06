import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Video, ResizeMode } from 'expo-av';
import { fonts, spacing } from '../../config/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Video source — statický require (Metro bundler ho resolvuje při buildu)
const welcomeVideo = require('../../../assets/videos/welcome.mp4');

interface WelcomeScreenProps {
  onReady: () => void;
}

export default function WelcomeScreen({ onReady }: WelcomeScreenProps) {
  const [videoReady, setVideoReady] = useState(false);
  const dismissed = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Animace
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  const dismiss = useCallback(() => {
    if (dismissed.current) return;
    dismissed.current = true;
    if (timerRef.current) clearTimeout(timerRef.current);
    Animated.timing(screenOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onReady();
    });
  }, [onReady, screenOpacity]);

  useEffect(() => {
    // Logo fade-in
    Animated.timing(logoOpacity, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Auto fade-out po 5s
    timerRef.current = setTimeout(dismiss, 5000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <TouchableWithoutFeedback onPress={dismiss}>
      <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
        {/* Fallback gradient — vždy pod videem */}
        <LinearGradient
          colors={['#006085', '#0F172A']}
          style={styles.fallbackGradient}
        />

        {/* Video pozadí — fullscreen, looping, muted */}
        <Video
          source={welcomeVideo}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isLooping
          isMuted
          onLoad={() => setVideoReady(true)}
          onError={(err) => console.warn('[Welcome] Video error:', err)}
        />

        {/* Gradient overlay přes video — tmavý gradient dole pro čitelnost textu */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(15,23,42,0.85)']}
          locations={[0, 0.4, 1]}
          style={styles.gradient}
        />

        {/* Logo + tagline — centrované, stejné jako na login screenu */}
        <View style={styles.content}>
          <Animated.View style={[styles.logoContainer, { opacity: logoOpacity }]}>
            <Image
              source={require('../../../assets/images/bedr-logo-white.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.tagline}>MAKE YOUR BODY BETTER</Text>
          </Animated.View>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_W,
    height: SCREEN_H,
    zIndex: 1,
  },
  fallbackGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0,
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  content: {
    flex: 1,
    zIndex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoImage: {
    width: 220,
    height: 88,
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginTop: spacing.md,
  },
});

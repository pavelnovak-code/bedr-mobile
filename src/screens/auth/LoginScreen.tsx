import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Animated,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../context/AuthContext';
import GradientButton from '../../components/common/GradientButton';
import { gradients, fonts, spacing, radius } from '../../config/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Animations ──────────────────────────────────────
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formTranslateY = useRef(new Animated.Value(30)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo entrance
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Form slides up
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(formTranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(formOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // ── Auth logic ──────────────────────────────────────
  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Vyplňte email a heslo');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Přihlášení se nezdařilo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#006085', '#0F172A']}
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Animated Logo Section ────────────────── */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            {/* Pulsing decorative circle */}
            <Animated.View
              style={[
                styles.pulseCircle,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />

            {/* BEDR Logo Image */}
            <Image
              source={require('../../../assets/images/bedr-logo-white.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />

            {/* Tagline */}
            <Text style={styles.tagline}>MAKE YOUR BODY BETTER</Text>
          </Animated.View>

          {/* ── Error Alert ──────────────────────────── */}
          {!!error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={() => setError('')}>
                <Ionicons name="close" size={18} color="rgba(255,255,255,0.7)" />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Form Section (slides up) ─────────────── */}
          <Animated.View
            style={[
              styles.formSection,
              {
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              },
            ]}
          >
            {/* Email Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="rgba(255,255,255,0.5)"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.textInput}
                  placeholder="vas@email.cz"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  selectionColor="rgba(255,255,255,0.5)"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Heslo</Text>
              <View style={styles.inputContainer}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color="rgba(255,255,255,0.5)"
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="Vaše heslo"
                  placeholderTextColor="rgba(255,255,255,0.35)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  autoCapitalize="none"
                  autoCorrect={false}
                  selectionColor="rgba(255,255,255,0.5)"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color="rgba(255,255,255,0.7)"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <View style={styles.buttonWrapper}>
              <GradientButton
                title="Přihlásit se"
                onPress={handleLogin}
                gradientColors={gradients.energy}
                loading={loading}
                fullWidth
                size="lg"
              />
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Zapomenuté heslo?</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* ── Footer ───────────────────────────────── */}
          <Animated.View
            style={[
              styles.footer,
              {
                opacity: formOpacity,
                transform: [{ translateY: formTranslateY }],
              },
            ]}
          >
            <Text style={styles.footerText}>Nemáte účet?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register', {})}>
              <Text style={styles.registerLink}> Zaregistrujte se</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

// ═══════════════════════════════════════════════════════
//  STYLES
// ═══════════════════════════════════════════════════════
const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },

  // ── Logo ──────────────────────────────────────────
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxl + 8,
  },
  pulseCircle: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -30,
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

  // ── Error ─────────────────────────────────────────
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#fca5a5',
  },

  // ── Form ──────────────────────────────────────────
  formSection: {
    marginBottom: spacing.xl,
  },
  inputWrapper: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.sm,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    height: 52,
  },
  inputIcon: {
    marginRight: spacing.md,
  },
  textInput: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    color: '#ffffff',
    height: '100%',
    paddingVertical: 0,
  },
  passwordInput: {
    paddingRight: spacing.xxl,
  },
  eyeButton: {
    position: 'absolute',
    right: spacing.lg,
  },

  // ── Button ────────────────────────────────────────
  buttonWrapper: {
    marginTop: spacing.sm,
  },

  // ── Links ─────────────────────────────────────────
  forgotLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  forgotText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: '#ffffff',
  },

  // ── Footer ────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  registerLink: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: '#ffffff',
  },
});

import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Alert, Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Crypto from 'expo-crypto';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import Spinner from '../components/common/Spinner';
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import PINSetupScreen from '../screens/auth/PINSetupScreen';
import PINLoginScreen from '../screens/auth/PINLoginScreen';
import BiometricSetupScreen from '../screens/auth/BiometricSetupScreen';
import {
  isPinSetup,
  getPinHash,
  setPinHash,
  clearPin,
  isBiometricEnabled,
  setBiometricEnabled,
} from '../utils/storage';

// Deep linking konfigurace
const linking = {
  prefixes: ['bedr://', 'https://app.bedr.cz'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password',
      Dashboard: 'dashboard',
      Booking: 'book',
      Profile: 'profile',
    },
  },
};

type SecurityStep = 'welcome' | 'loading' | 'pin_login' | 'pin_setup' | 'biometric_setup' | 'authenticated';

async function hashPin(pin: string): Promise<string> {
  return await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export default function RootNavigator() {
  const { isLoggedIn, isLoading, logout } = useAuth();
  const [securityStep, setSecurityStep] = useState<SecurityStep>('welcome');
  const [forgotPinMode, setForgotPinMode] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [welcomeDone, setWelcomeDone] = useState(false);

  // Reusable biometric auth — volá se automaticky i z PIN screenu (retry)
  const tryBiometric = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[Bio] tryBiometric called');

      // Ověř hardware a enrollment před pokusem
      const hasHW = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      console.log('[Bio] hasHardware:', hasHW, 'isEnrolled:', isEnrolled);

      if (!hasHW || !isEnrolled) {
        console.log('[Bio] Biometrie není dostupná na zařízení');
        Alert.alert('Face ID', `HW: ${hasHW}, Enrolled: ${isEnrolled}`);
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Přihlášení do BEDR',
        cancelLabel: 'Zadat PIN',
        fallbackLabel: 'Zadat PIN',
        disableDeviceFallback: false,
      });

      console.log('[Bio] Auth result:', JSON.stringify(result));

      if (result.success) {
        setSecurityStep('authenticated');
        return true;
      } else {
        console.log('[Bio] Auth failed:', result.error);
        // Debug alert — smaž po vyřešení
        Alert.alert('Face ID debug', `success: ${result.success}\nerror: ${result.error}`);
      }
    } catch (err: any) {
      console.error('[Bio] authenticateAsync error:', err);
      Alert.alert('Face ID error', err?.message || String(err));
    }
    return false;
  }, []);

  // Po welcome screenu: zkontroluj PIN stav a biometrii
  useEffect(() => {
    if (!welcomeDone || isLoading) return;
    if (!isLoggedIn) {
      setSecurityStep('loading');
      return;
    }

    (async () => {
      const hasPin = await isPinSetup();
      console.log('[Auth] hasPin:', hasPin, 'isLoggedIn:', isLoggedIn);
      if (!hasPin) {
        setSecurityStep('pin_setup');
        return;
      }

      // Má PIN → zkontroluj biometrii
      const bioEnabled = await isBiometricEnabled();
      console.log('[Auth] bioEnabled (from storage):', bioEnabled);

      if (bioEnabled) {
        try {
          const bioHW = await LocalAuthentication.hasHardwareAsync();
          const enrolled = await LocalAuthentication.isEnrolledAsync();
          console.log('[Auth] bioHW:', bioHW, 'enrolled:', enrolled);

          if (bioHW && enrolled) {
            setBiometricAvailable(true);
            // Auto-try biometrie
            console.log('[Auth] Auto-trying biometric...');
            const success = await tryBiometric();
            console.log('[Auth] Auto biometric result:', success);
            if (success) return;
          }
        } catch (err) {
          console.error('[Auth] Biometric check error:', err);
        }
      }

      // Biometrie neproběhla → PIN login
      console.log('[Auth] → pin_login');
      setSecurityStep('pin_login');
    })();
  }, [welcomeDone, isLoggedIn, isLoading, tryBiometric]);

  // Resetuj stav při odhlášení (ale ne welcome — ten se znovu neukazuje)
  useEffect(() => {
    if (!isLoggedIn && welcomeDone) {
      setSecurityStep('loading');
      setForgotPinMode(false);
      setBiometricAvailable(false);
    }
  }, [isLoggedIn, welcomeDone]);

  // Handler: welcome screen hotový
  const handleWelcomeReady = useCallback(() => {
    setWelcomeDone(true);
    setSecurityStep('loading');
  }, []);

  // Handler: PIN setup dokončen
  const handlePinSetupComplete = useCallback(async (pin: string) => {
    const hash = await hashPin(pin);
    await setPinHash(hash);

    try {
      const bioAvailable = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (bioAvailable && enrolled) {
        setSecurityStep('biometric_setup');
        return;
      }
    } catch {}

    setSecurityStep('authenticated');
  }, []);

  // Handler: ověření PINu
  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    const storedHash = await getPinHash();
    if (!storedHash) return false;
    const inputHash = await hashPin(pin);
    return inputHash === storedHash;
  }, []);

  // Handler: PIN úspěšný
  const handlePinSuccess = useCallback(() => {
    setSecurityStep('authenticated');
  }, []);

  // Handler: zapomněl PIN → odhlásit → heslo → nový PIN
  const handleForgotPin = useCallback(async () => {
    await clearPin();
    await setBiometricEnabled(false);
    await logout();
    setForgotPinMode(true);
  }, [logout]);

  // Handler: zapnutí biometrie
  const handleEnableBiometric = useCallback(async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Ověření pro zapnutí Face ID',
        cancelLabel: 'Zrušit',
      });
      if (result.success) {
        await setBiometricEnabled(true);
      }
    } catch {}
    setSecurityStep('authenticated');
  }, []);

  // Handler: přeskočení biometrie
  const handleSkipBiometric = useCallback(() => {
    setSecurityStep('authenticated');
  }, []);

  // ─── RENDER ──────────────────────────────────────────────

  // Welcome screen — vždy první při startu
  if (securityStep === 'welcome') {
    return <WelcomeScreen onReady={handleWelcomeReady} />;
  }

  // Loading
  if (isLoading) {
    return <Spinner fullScreen message="Načítám..." />;
  }

  // Nepřihlášen → AuthStack
  if (!isLoggedIn) {
    return (
      <NavigationContainer linking={linking}>
        <AuthStack />
      </NavigationContainer>
    );
  }

  // Přihlášen → security flow
  switch (securityStep) {
    case 'loading':
      return <Spinner fullScreen message="Načítám..." />;

    case 'pin_setup':
      return <PINSetupScreen onComplete={handlePinSetupComplete} />;

    case 'biometric_setup':
      return (
        <BiometricSetupScreen
          onEnable={handleEnableBiometric}
          onSkip={handleSkipBiometric}
        />
      );

    case 'pin_login':
      return (
        <PINLoginScreen
          onSuccess={handlePinSuccess}
          onForgotPIN={handleForgotPin}
          verifyPin={verifyPin}
          maxAttempts={2}
          biometricAvailable={biometricAvailable}
          onFaceId={tryBiometric}
        />
      );

    case 'authenticated':
      return (
        <NavigationContainer linking={linking}>
          <MainTabs />
        </NavigationContainer>
      );
  }
}

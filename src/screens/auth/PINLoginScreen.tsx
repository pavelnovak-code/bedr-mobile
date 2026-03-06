import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { fonts, spacing } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface PINLoginScreenProps {
  onSuccess: () => void;
  onForgotPIN: () => void;
  verifyPin: (pin: string) => Promise<boolean>;
  maxAttempts?: number;
  onFaceId?: () => Promise<boolean>;
  biometricAvailable?: boolean;
}

export default function PINLoginScreen({
  onSuccess,
  onForgotPIN,
  verifyPin,
  maxAttempts = 2,
  onFaceId,
  biometricAvailable,
}: PINLoginScreenProps) {
  const { colors } = useTheme();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [faceIdLoading, setFaceIdLoading] = useState(false);

  const handleDigit = async (digit: string) => {
    setError('');
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      const valid = await verifyPin(next);
      if (valid) {
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');
        if (newAttempts >= maxAttempts) {
          setError('Příliš mnoho pokusů. Přihlaste se heslem.');
          setTimeout(onForgotPIN, 1500);
        } else {
          setError(`Špatný PIN. Zbývá ${maxAttempts - newAttempts} pokus.`);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Zadejte PIN</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>Zadejte 4místný PIN pro přihlášení</Text>

        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[styles.dot, { borderColor: colors.primary }, i < pin.length && { backgroundColor: colors.primary }]}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.keypad}>
          {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', '⌫']].map((row, ri) => (
            <View key={ri} style={styles.keyRow}>
              {row.map((key, ki) => (
                <TouchableOpacity
                  key={ki}
                  style={[styles.key, { backgroundColor: key ? colors.card : 'transparent' }]}
                  onPress={() => {
                    if (key === '⌫') handleDelete();
                    else if (key) handleDigit(key);
                  }}
                  disabled={!key || pin.length >= 4}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.keyText, { color: colors.text }, key === '⌫' && styles.keyDeleteText]}>
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>

        {/* Face ID tlačítko — zobrazí se jen pokud je biometrie dostupná */}
        {biometricAvailable && (
          <TouchableOpacity
            onPress={async () => {
              if (faceIdLoading) return;
              setFaceIdLoading(true);
              setError('');
              console.log('[PIN] Face ID button pressed');
              try {
                const success = await onFaceId?.();
                console.log('[PIN] Face ID result:', success);
                if (!success) {
                  setError('Face ID se nezdařilo. Zadejte PIN.');
                }
              } catch (err) {
                console.error('[PIN] Face ID error:', err);
                setError('Chyba Face ID. Zadejte PIN.');
              } finally {
                setFaceIdLoading(false);
              }
            }}
            style={[styles.faceIdBtn, faceIdLoading && { opacity: 0.5 }]}
            activeOpacity={0.7}
            disabled={faceIdLoading}
          >
            <View style={[styles.faceIdCircle, { borderColor: colors.primary }]}>
              <Ionicons name="scan-outline" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.faceIdText, { color: colors.muted }]}>
              {faceIdLoading ? 'Ověřuji...' : 'Face ID'}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={onForgotPIN} style={styles.forgotBtn}>
          <Text style={[styles.forgotText, { color: colors.primary }]}>Zapomněl jsem PIN</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  title: { fontFamily: fonts.headingBold, fontSize: 24, marginBottom: spacing.sm },
  subtitle: { fontFamily: fonts.regular, fontSize: 14, textAlign: 'center', marginBottom: spacing.xxl },
  dotsRow: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2, backgroundColor: 'transparent',
  },
  error: { fontFamily: fonts.medium, fontSize: 13, color: '#ef4444', marginBottom: spacing.md, textAlign: 'center' },
  keypad: { width: '100%', maxWidth: 280 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md },
  key: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  keyText: { fontFamily: fonts.semiBold, fontSize: 24 },
  keyDeleteText: { fontSize: 20 },
  faceIdBtn: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  faceIdCircle: {
    width: 60, height: 60, borderRadius: 30,
    borderWidth: 1.5,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'transparent',
  },
  faceIdText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  forgotBtn: { marginTop: spacing.lg, padding: spacing.md },
  forgotText: { fontFamily: fonts.medium, fontSize: 14 },
});

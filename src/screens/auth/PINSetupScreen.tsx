import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { fonts, spacing } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface PINSetupScreenProps {
  onComplete: (pin: string) => void;
}

export default function PINSetupScreen({ onComplete }: PINSetupScreenProps) {
  const { colors } = useTheme();
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [error, setError] = useState('');

  const handleDigit = (digit: string) => {
    setError('');
    if (step === 'enter') {
      const next = pin + digit;
      setPin(next);
      if (next.length === 4) {
        setTimeout(() => setStep('confirm'), 200);
      }
    } else {
      const next = confirmPin + digit;
      setConfirmPin(next);
      if (next.length === 4) {
        if (next === pin) {
          onComplete(next);
        } else {
          setError('PINy se neshodují. Zkuste znovu.');
          setPin('');
          setConfirmPin('');
          setStep('enter');
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'enter') {
      setPin(pin.slice(0, -1));
    } else {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const currentPin = step === 'enter' ? pin : confirmPin;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {step === 'enter' ? 'Nastavte si PIN' : 'Potvrďte PIN'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {step === 'enter'
            ? 'Zadejte 4místný PIN pro rychlé přihlášení'
            : 'Zadejte PIN znovu pro potvrzení'}
        </Text>

        {/* PIN indikátory */}
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3].map(i => (
            <View
              key={i}
              style={[styles.dot, { borderColor: colors.primary }, i < currentPin.length && { backgroundColor: colors.primary }]}
            />
          ))}
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {/* Numerická klávesnice */}
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
                  disabled={!key || currentPin.length >= 4}
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
  error: { fontFamily: fonts.medium, fontSize: 13, color: '#ef4444', marginBottom: spacing.md },
  keypad: { width: '100%', maxWidth: 280 },
  keyRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.md },
  key: {
    width: 72, height: 72, borderRadius: 36,
    justifyContent: 'center', alignItems: 'center',
  },
  keyText: { fontFamily: fonts.semiBold, fontSize: 24 },
  keyDeleteText: { fontSize: 20 },
});

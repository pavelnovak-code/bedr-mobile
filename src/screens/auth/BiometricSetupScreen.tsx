import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from '../../components/common/Button';
import { fonts, spacing, radius, shadows } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

interface BiometricSetupScreenProps {
  onEnable: () => void;
  onSkip: () => void;
}

export default function BiometricSetupScreen({ onEnable, onSkip }: BiometricSetupScreenProps) {
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.container}>
        <Text style={styles.icon}>🔐</Text>
        <Text style={[styles.title, { color: colors.text }]}>Chcete zapnout Face ID?</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Místo zadávání PINu se můžete přihlásit obličejem nebo otiskem prstu.
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Button
            title="Zapnout Face ID"
            onPress={onEnable}
            fullWidth
            size="lg"
          />
          <Button
            title="Přeskočit"
            variant="ghost"
            onPress={onSkip}
            fullWidth
            size="lg"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl,
  },
  icon: { fontSize: 64, marginBottom: spacing.lg },
  title: {
    fontFamily: fonts.headingBold, fontSize: 24,
    textAlign: 'center', marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: fonts.regular, fontSize: 15,
    textAlign: 'center', marginBottom: spacing.xxl, maxWidth: 280,
    lineHeight: 22,
  },
  card: {
    width: '100%', maxWidth: 320,
    borderRadius: radius.lg,
    padding: spacing.xl,
    ...shadows.md,
  },
});

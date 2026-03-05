import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useStudio } from '../../context/StudioContext';
import { bookReservation } from '../../api/reservations';
import { validatePromoCode } from '../../api/crm';
import { formatDT } from '../../utils/dateFormat';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import { colors, fonts, spacing, radius } from '../../config/theme';

type Props = NativeStackScreenProps<BookingStackParamList, 'ConfirmPay'>;

export default function ConfirmPayScreen({ navigation, route }: Props) {
  const { purchaseId, slotDatetime } = route.params;
  const { studioId } = useStudio();

  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<string | null>(null);
  const [promoValid, setPromoValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleValidatePromo = async () => {
    if (!promoCode.trim() || !studioId) return;
    try {
      const result = await validatePromoCode(promoCode.trim(), studioId);
      if (result.valid) {
        setPromoResult(`Sleva ${result.discount_percent}%`);
        setPromoValid(true);
      } else {
        setPromoResult(result.message || 'Neplatný kód');
        setPromoValid(false);
      }
    } catch (e: any) {
      setPromoResult('Nepodařilo se ověřit kód');
      setPromoValid(false);
    }
  };

  const handleConfirm = async () => {
    if (!studioId) return;
    setLoading(true);
    setError('');
    try {
      await bookReservation({
        purchase_id: purchaseId,
        slot_datetime: slotDatetime,
        studio_id: studioId,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Rezervace se nezdařila');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successIcon}>✅</Text>
        <Text style={styles.successTitle}>Rezervace potvrzena!</Text>
        <Text style={styles.successText}>{formatDT(slotDatetime)}</Text>
        <Button
          title="Zpět na přehled"
          onPress={() => navigation.getParent()?.goBack()}
          fullWidth
          size="lg"
          style={{ marginTop: spacing.xl }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Krok 3: Potvrzení</Text>

      <Alert message={error} visible={!!error} onDismiss={() => setError('')} />

      <Card style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Vybraný termín:</Text>
        <Text style={styles.summaryValue}>{formatDT(slotDatetime)}</Text>
      </Card>

      {/* Promo kód */}
      <Card style={styles.promoCard}>
        <Text style={styles.promoTitle}>Promo kód (nepovinné)</Text>
        <View style={styles.promoRow}>
          <View style={styles.promoInput}>
            <Input
              placeholder="Zadejte kód"
              value={promoCode}
              onChangeText={setPromoCode}
            />
          </View>
          <Button
            title="Ověřit"
            variant="secondary"
            size="sm"
            onPress={handleValidatePromo}
          />
        </View>
        {promoResult && (
          <Text style={[styles.promoResult, promoValid ? styles.promoOk : styles.promoErr]}>
            {promoResult}
          </Text>
        )}
      </Card>

      <Button
        title="Potvrdit rezervaci"
        onPress={handleConfirm}
        loading={loading}
        fullWidth
        size="lg"
        style={{ marginTop: spacing.xl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },
  heading: { fontFamily: fonts.heading, fontSize: 18, color: colors.text, marginBottom: spacing.lg },

  summaryCard: { marginBottom: spacing.lg },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginBottom: spacing.xs },
  summaryValue: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.primary },

  promoCard: { marginBottom: spacing.md },
  promoTitle: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, marginBottom: spacing.sm },
  promoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  promoInput: { flex: 1 },
  promoResult: { fontFamily: fonts.medium, fontSize: 13, marginTop: spacing.xs },
  promoOk: { color: colors.success },
  promoErr: { color: colors.danger },

  // Success
  successContainer: {
    flex: 1, backgroundColor: colors.bg, justifyContent: 'center',
    alignItems: 'center', padding: spacing.xl,
  },
  successIcon: { fontSize: 64, marginBottom: spacing.lg },
  successTitle: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text, marginBottom: spacing.sm },
  successText: { fontFamily: fonts.regular, fontSize: 16, color: colors.primary },
});

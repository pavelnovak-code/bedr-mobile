import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { BookingStackParamList } from '../../navigation/BookingStack';
import { useStudio } from '../../context/StudioContext';
import { useTheme } from '../../context/ThemeContext';
import { createPurchase } from '../../api/purchases';
import { validatePromoCode } from '../../api/crm';
import { formatDT } from '../../utils/dateFormat';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import GradientButton from '../../components/common/GradientButton';
import Alert from '../../components/common/Alert';
import Card from '../../components/common/Card';
import StepIndicator from '../../components/common/StepIndicator';
import { fonts, spacing } from '../../config/theme';
import { formatPrice } from '../../utils/formatPrice';

type Props = NativeStackScreenProps<BookingStackParamList, 'ConfirmPay'>;

export default function ConfirmPayScreen({ navigation, route }: Props) {
  const { packageId, packageName, lessonCount, lessonTypeCode, price, slotDatetime } = route.params;
  const { studioId } = useStudio();
  const { colors } = useTheme();

  const [promoCode, setPromoCode] = useState('');
  const [promoResult, setPromoResult] = useState<string | null>(null);
  const [promoValid, setPromoValid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Reset stavu při novém otevření (navigate reuse fix)
  useFocusEffect(
    React.useCallback(() => {
      setSuccess(false);
      setError('');
      setPromoCode('');
      setPromoResult(null);
      setPromoValid(false);
    }, [slotDatetime])
  );

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
      setPromoResult(e.response?.data?.error || 'Nepodařilo se ověřit kód');
      setPromoValid(false);
    }
  };

  const handleConfirm = async () => {
    if (!studioId) return;
    setLoading(true);
    setError('');
    try {
      await createPurchase({
        package_id: packageId,
        studio_id: studioId,
        start_datetime: slotDatetime,
        payment_method: 'cash',
        promo_code: promoValid ? promoCode.trim() : undefined,
      });
      setSuccess(true);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Nákup se nezdařil');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.successContainer, { backgroundColor: colors.bg }]}>
        <Ionicons name="checkmark-circle" size={64} color={colors.success} style={{ marginBottom: spacing.lg }} />
        <Text style={[styles.successTitle, { color: colors.text }]}>Nákup dokončen!</Text>
        <Text style={[styles.successPkg, { color: colors.primary }]}>{packageName}</Text>
        <Text style={[styles.successText, { color: colors.text }]}>{formatDT(slotDatetime)}</Text>
        <Text style={[styles.successNote, { color: colors.muted }]}>
          {lessonCount > 1 ? `Zarezervováno ${lessonCount} lekcí (týdenní cyklus)` : 'Lekce zarezervována'}
        </Text>
        <GradientButton
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
    <View style={[styles.screenContainer, { backgroundColor: colors.bg }]}>
      <StepIndicator steps={['Balíček', 'Termín', 'Potvrzení']} currentStep={2} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
        <Alert message={error} visible={!!error} onDismiss={() => setError('')} />

      <Card style={styles.summaryCard}>
        <Text style={[styles.summaryLabel, { color: colors.muted }]}>Balíček</Text>
        <Text style={[styles.summaryValue, { color: colors.primary }]}>{packageName}</Text>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Typ lekce</Text>
          <Text style={[styles.summaryDetail, { color: colors.text }]}>{lessonTypeCode === 'B' ? 'EMS 60 min' : 'EMS 30 min'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>Počet lekcí</Text>
          <Text style={[styles.summaryDetail, { color: colors.text }]}>{lessonCount}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { color: colors.muted }]}>První lekce</Text>
          <Text style={[styles.summaryDetail, { color: colors.text }]}>{formatDT(slotDatetime)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.priceRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.priceLabel, { color: colors.text }]}>Cena</Text>
          <Text style={[styles.priceValue, { color: colors.primary }]}>{formatPrice(price)}</Text>
        </View>
      </Card>

      {/* Promo kód */}
      <Card style={styles.promoCard}>
        <Text style={[styles.promoTitle, { color: colors.text }]}>Promo kód (nepovinné)</Text>
        <View style={styles.promoRow}>
          <View style={styles.promoInput}>
            <Input
              placeholder="Zadejte kód"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
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
          <Text style={[styles.promoResult, { color: promoValid ? colors.success : colors.danger }]}>
            {promoResult}
          </Text>
        )}
      </Card>

      <Text style={[styles.paymentNote, { color: colors.muted }]}>
        Platba probíhá na místě ve studiu (kartou nebo hotově).
      </Text>

      <GradientButton
        title={`Objednat za ${formatPrice(price)}`}
        onPress={handleConfirm}
        loading={loading}
        fullWidth
        size="lg"
        style={{ marginTop: spacing.lg }}
      />
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: { flex: 1 },
  scroll: { flex: 1 },
  container: { padding: spacing.lg },

  summaryCard: { marginBottom: spacing.lg },
  summaryLabel: { fontFamily: fonts.regular, fontSize: 13 },
  summaryValue: { fontFamily: fonts.semiBold, fontSize: 17, marginBottom: spacing.md },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs },
  summaryDetail: { fontFamily: fonts.medium, fontSize: 14 },
  priceRow: { marginTop: spacing.sm, paddingTop: spacing.md, borderTopWidth: 1 },
  priceLabel: { fontFamily: fonts.semiBold, fontSize: 16 },
  priceValue: { fontFamily: fonts.bold, fontSize: 20 },

  promoCard: { marginBottom: spacing.md },
  promoTitle: { fontFamily: fonts.medium, fontSize: 14, marginBottom: spacing.sm },
  promoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  promoInput: { flex: 1 },
  promoResult: { fontFamily: fonts.medium, fontSize: 13, marginTop: spacing.xs },

  paymentNote: { fontFamily: fonts.regular, fontSize: 13, textAlign: 'center' },

  // Success
  successContainer: {
    flex: 1, justifyContent: 'center',
    alignItems: 'center', padding: spacing.xl,
  },
  successTitle: { fontFamily: fonts.headingBold, fontSize: 24, marginBottom: spacing.sm },
  successPkg: { fontFamily: fonts.semiBold, fontSize: 16, marginBottom: spacing.xs },
  successText: { fontFamily: fonts.regular, fontSize: 16 },
  successNote: { fontFamily: fonts.regular, fontSize: 13, marginTop: spacing.sm },
});

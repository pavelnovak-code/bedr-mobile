import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert as RNAlert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useStudio } from '../../context/StudioContext';
import { toVocative } from '../../utils/vocative';
import { formatDT } from '../../utils/dateFormat';
import { getMyReservations, cancelReservation } from '../../api/reservations';
import { getMyPurchases } from '../../api/purchases';
import { getBadges } from '../../api/users';
import { Reservation, Purchase, Badge } from '../../api/types';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { colors, fonts, spacing, radius, shadows } from '../../config/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { studioId } = useStudio();
  const greeting = user?.jmeno ? toVocative(user.jmeno) : '';

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    console.log('[Dashboard] loadData, studioId:', studioId);
    if (!studioId) { setLoading(false); return; }
    try {
      const [resRaw, purchRaw, bdg] = await Promise.all([
        getMyReservations(studioId).catch(() => []),
        getMyPurchases(studioId).catch(() => []),
        getBadges().catch(() => ({ badges: [] })),
      ]);
      // Bezpečná konverze – API může vrátit objekt místo pole
      const res = Array.isArray(resRaw) ? resRaw : (resRaw as any)?.reservations || [];
      const purch = Array.isArray(purchRaw) ? purchRaw : (purchRaw as any)?.purchases || [];
      console.log('[Dashboard] reservations:', res.length, 'purchases:', purch.length);
      // Jen budoucí potvrzené lekce
      const now = new Date().toISOString();
      setReservations(
        res.filter((r: any) => r.status === 'confirmed' && r.slot_datetime > now)
           .sort((a: any, b: any) => a.slot_datetime.localeCompare(b.slot_datetime))
           .slice(0, 3)
      );
      // Aktivní balíčky (lessons_remaining > 0)
      setPurchases(purch.filter((p: any) => p.lessons_remaining > 0).slice(0, 3));
      // Badges API vrací { badges: [...] }
      const badgeList = Array.isArray(bdg) ? bdg : (bdg as any)?.badges || [];
      setBadges(badgeList.filter((b: any) => b.earned).slice(0, 5));
    } catch (err) {
      console.error('[Dashboard] Error:', err);
    }
    setLoading(false);
  }, [studioId]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleCancel = (id: number) => {
    RNAlert.alert('Zrušit lekci', 'Opravdu chcete zrušit tuto rezervaci?', [
      { text: 'Ne', style: 'cancel' },
      {
        text: 'Ano, zrušit',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelReservation(id);
            loadData();
          } catch {}
        },
      },
    ]);
  };

  if (loading) return <Spinner fullScreen message="Načítám přehled..." />;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              {greeting ? `Dobrý den, ${greeting}! 👋` : 'Dobrý den! 👋'}
            </Text>
            <Text style={styles.sub}>Váš přehled</Text>
          </View>
          <Avatar avatar={user?.avatar || null} size={48} />
        </View>

        {/* Nadcházející lekce */}
        <Text style={styles.sectionTitle}>Nadcházející lekce</Text>
        {reservations.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Žádné nadcházející lekce</Text>
          </Card>
        ) : (
          reservations.map(r => (
            <Card key={r.id} style={styles.lessonCard}>
              <View style={styles.lessonHeader}>
                <Text style={styles.lessonPkg}>{r.package_name || 'Lekce'}</Text>
                <Text style={styles.lessonType}>
                  {r.lt_code === 'B' ? '60 min' : '30 min'}
                </Text>
              </View>
              <Text style={styles.lessonTime}>{formatDT(r.slot_datetime)}</Text>
              {r.trainer_name && (
                <Text style={styles.lessonTrainer}>Trenér: {r.trainer_name}</Text>
              )}
              <View style={styles.lessonActions}>
                <Button
                  title="Zrušit"
                  variant="outline"
                  size="sm"
                  onPress={() => handleCancel(r.id)}
                />
              </View>
            </Card>
          ))
        )}

        {/* Aktivní balíčky */}
        <Text style={styles.sectionTitle}>Aktivní balíčky</Text>
        {purchases.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Žádné aktivní balíčky</Text>
          </Card>
        ) : (
          purchases.map(p => {
            const total = p.lessons_total || 0;
            const remaining = p.lessons_remaining || 0;
            const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
            // Platnost: first_lesson_at + validity_weeks
            let validityText = '';
            if (p.validity_weeks && p.validity_weeks > 0) {
              if (p.first_lesson_at) {
                const exp = new Date(new Date(p.first_lesson_at).getTime() + p.validity_weeks * 7 * 86400000);
                validityText = `Platnost do: ${exp.toLocaleDateString('cs-CZ')}`;
              } else {
                validityText = `Platnost: ${p.validity_weeks} týdnů od první lekce`;
              }
            }
            return (
              <Card key={p.id} style={styles.pkgCard}>
                <Text style={styles.pkgName}>{p.package_name}</Text>
                <View style={styles.pkgRow}>
                  <Text style={styles.pkgLabel}>Zbývá lekcí:</Text>
                  <Text style={styles.pkgValue}>
                    {remaining} / {total}
                  </Text>
                </View>
                {/* Progress bar */}
                <View style={styles.progressBg}>
                  <View style={[styles.progressFill, { width: `${pct}%` }]} />
                </View>
                {validityText ? <Text style={styles.pkgValid}>{validityText}</Text> : null}
              </Card>
            );
          })
        )}

        {/* Odznaky */}
        {badges.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Odznaky</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.badgeRow}>
                {badges.map(b => (
                  <View key={b.id} style={styles.badgeItem}>
                    <Text style={styles.badgeIcon}>{b.emoji}</Text>
                    <Text style={styles.badgeName}>{b.name}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          </>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },
  container: { padding: spacing.lg },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.sm,
  },
  headerLeft: { flex: 1 },
  greeting: { fontFamily: fonts.headingBold, fontSize: 24, color: colors.text },
  sub: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginTop: 2 },

  sectionTitle: {
    fontFamily: fonts.heading,
    fontSize: 17,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.lg,
  },

  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },

  // Lekce
  lessonCard: { marginBottom: spacing.md },
  lessonHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lessonPkg: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  lessonType: { fontFamily: fonts.medium, fontSize: 12, color: colors.muted, backgroundColor: colors.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  lessonTime: { fontFamily: fonts.regular, fontSize: 14, color: colors.primary, marginTop: spacing.xs },
  lessonTrainer: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
  lessonActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md, gap: spacing.sm },

  // Balíčky
  pkgCard: { marginBottom: spacing.md },
  pkgName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, marginBottom: spacing.sm },
  pkgRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  pkgLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  pkgValue: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary },
  progressBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginVertical: spacing.sm },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  pkgValid: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },

  // Odznaky
  badgeRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.xs },
  badgeItem: { alignItems: 'center', width: 64 },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontFamily: fonts.medium, fontSize: 11, color: colors.text, textAlign: 'center', marginTop: 4 },
});

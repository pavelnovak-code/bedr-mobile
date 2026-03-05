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
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
import SwipeableRow from '../../components/common/SwipeableRow';
import RescheduleModal from '../../components/dashboard/RescheduleModal';
import { colors, fonts, spacing, radius, shadows } from '../../config/theme';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { studioId, studios, currentStudio, setStudioId: switchStudio } = useStudio();
  const navigation = useNavigation<any>();
  const greeting = user?.jmeno ? toVocative(user.jmeno) : '';

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rescheduleId, setRescheduleId] = useState<number | null>(null);
  const [rescheduleLtCode, setRescheduleLtCode] = useState<string | undefined>(undefined);

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
      // Aktivní balíčky (backend vrací jen is_active = 1)
      setPurchases(purch);
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

        {/* Výběr studia */}
        {studios.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.studioBar}>
            <View style={styles.studioRow}>
              {studios.map(s => (
                <TouchableOpacity
                  key={s.id}
                  onPress={() => switchStudio(s.id)}
                  style={[styles.studioPill, s.id === studioId && styles.studioPillActive]}
                >
                  <Text style={[styles.studioPillText, s.id === studioId && styles.studioPillTextActive]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Nadcházející lekce */}
        <Text style={styles.sectionTitle}>Nadcházející lekce</Text>
        {reservations.length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Žádné nadcházející lekce</Text>
          </Card>
        ) : (
          reservations.map(r => (
            <SwipeableRow
              key={r.id}
              onSwipeAction={() => handleCancel(r.id)}
              actionLabel="Zrušit"
            >
              <Card style={styles.lessonCard}>
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
                    title="Přesunout"
                    variant="secondary"
                    size="sm"
                    onPress={() => { setRescheduleId(r.id); setRescheduleLtCode(r.lt_code); }}
                  />
                </View>
              </Card>
            </SwipeableRow>
          ))
        )}

        {/* Aktivní balíčky — v přehledu jen ty s pkg_status === 'active' */}
        <Text style={styles.sectionTitle}>Aktivní balíčky</Text>
        {purchases.filter(p => p.pkg_status === 'active').length === 0 ? (
          <Card>
            <Text style={styles.emptyText}>Žádné aktivní balíčky</Text>
          </Card>
        ) : (
          purchases.filter(p => p.pkg_status === 'active').map(p => {
            const remaining = p.lessons_remaining || 0;
            const isGift = p.payment_method === 'bonus';
            // Platnost: computed z backendu validity_end, nebo fallback
            let validityText = '';
            if (p.validity_end) {
              validityText = `Platnost do: ${new Date(p.validity_end).toLocaleDateString('cs-CZ')}`;
            } else if (p.validity_weeks && p.validity_weeks > 0) {
              validityText = `Platnost: ${p.validity_weeks} týdnů od první lekce`;
            }
            return (
              <Card key={p.id} style={styles.pkgCard}>
                {isGift && (
                  <View style={styles.giftBadge}>
                    <Text style={styles.giftBadgeText}>
                      🎁 Dárek{p.referred_friend_name ? ` za doporučení ${p.referred_friend_name}` : ''}
                    </Text>
                  </View>
                )}
                <Text style={styles.pkgName}>{p.package_name}</Text>
                <View style={styles.pkgRow}>
                  <Text style={styles.pkgLabel}>Zbývá lekcí</Text>
                  <Text style={styles.pkgValue}>{remaining}</Text>
                </View>
                {validityText ? <Text style={styles.pkgValid}>{validityText}</Text> : null}
                {remaining > 0 && (
                  <View style={styles.pkgActions}>
                    <Button
                      title="Rezervovat lekci"
                      variant="secondary"
                      size="sm"
                      onPress={() => {
                        navigation.navigate('Booking', {
                          screen: 'CalendarSlots',
                          params: {
                            packageId: p.package_id,
                            packageName: p.package_name,
                            lessonCount: 1,
                            lessonTypeCode: p.lesson_type_code || 'A',
                            price: 0,
                            purchaseId: p.id,
                          },
                        });
                      }}
                    />
                  </View>
                )}
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

      <RescheduleModal
        visible={rescheduleId !== null}
        reservationId={rescheduleId ?? 0}
        lessonTypeCode={rescheduleLtCode}
        onClose={() => setRescheduleId(null)}
        onMoved={() => {
          setRescheduleId(null);
          loadData();
        }}
      />
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

  // Studio selector
  studioBar: { marginBottom: spacing.sm },
  studioRow: { flexDirection: 'row', gap: spacing.sm },
  studioPill: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  studioPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  studioPillText: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  studioPillTextActive: { color: colors.white },

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
  pkgCardInactive: { opacity: 0.65 },
  pkgHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.xs },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  statusBadgeText: { fontFamily: fonts.medium, fontSize: 11 },
  giftBadge: {
    backgroundColor: '#fef3c7',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
    alignSelf: 'flex-start',
  },
  giftBadgeText: { fontFamily: fonts.medium, fontSize: 12, color: '#92400e' },
  pkgName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text, marginBottom: spacing.sm },
  pkgRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xs },
  pkgLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  pkgValue: { fontFamily: fonts.semiBold, fontSize: 13, color: colors.primary },
  progressBg: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginVertical: spacing.sm },
  progressFill: { height: 6, backgroundColor: colors.primary, borderRadius: 3 },
  pkgValid: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },
  pkgActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: spacing.md },

  // Odznaky
  badgeRow: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.xs },
  badgeItem: { alignItems: 'center', width: 64 },
  badgeIcon: { fontSize: 32 },
  badgeName: { fontFamily: fonts.medium, fontSize: 11, color: colors.text, textAlign: 'center', marginTop: 4 },
});

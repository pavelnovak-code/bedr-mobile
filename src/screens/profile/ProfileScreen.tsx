import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Switch,
  Share,
  Alert as RNAlert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useStudio } from '../../context/StudioContext';
import * as usersApi from '../../api/users';
import { getMyPurchases } from '../../api/purchases';
import { getMyReservations } from '../../api/reservations';
import { User, Purchase, Reservation, Badge, Offer, ReferralStats } from '../../api/types';
import Avatar from '../../components/common/Avatar';
import AvatarPicker from '../../components/common/AvatarPicker';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Spinner from '../../components/common/Spinner';
import { colors, fonts, spacing, radius } from '../../config/theme';
import { formatDT } from '../../utils/dateFormat';

type TabKey = 'info' | 'purchases' | 'lessons' | 'badges' | 'offers' | 'referral' | 'consent';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Profil' },
  { key: 'purchases', label: 'Nákupy' },
  { key: 'lessons', label: 'Lekce' },
  { key: 'badges', label: 'Odznaky' },
  { key: 'offers', label: 'Nabídky' },
  { key: 'referral', label: 'Referral' },
  { key: 'consent', label: 'GDPR' },
];

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { studioId } = useStudio();
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Profile info
  const [editJmeno, setEditJmeno] = useState(user?.jmeno || '');
  const [editPrijmeni, setEditPrijmeni] = useState(user?.prijmeni || '');
  const [editTelefon, setEditTelefon] = useState(user?.telefon || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || 'avatar:1');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  // Data
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [referral, setReferral] = useState<ReferralStats | null>(null);
  const [consent, setConsent] = useState(!!user?.gdpr_consent);

  const loadTabData = useCallback(async () => {
    if (!studioId) return;
    try {
      if (activeTab === 'purchases') {
        const raw = await getMyPurchases(studioId);
        setPurchases(Array.isArray(raw) ? raw : (raw as any)?.purchases || []);
      } else if (activeTab === 'lessons') {
        const raw = await getMyReservations(studioId);
        setReservations(Array.isArray(raw) ? raw : (raw as any)?.reservations || []);
      } else if (activeTab === 'badges') {
        const raw = await usersApi.getBadges();
        setBadges(Array.isArray(raw) ? raw : (raw as any)?.badges || []);
      } else if (activeTab === 'offers') {
        const raw = await usersApi.getOffers();
        setOffers(Array.isArray(raw) ? raw : (raw as any)?.offers || []);
      } else if (activeTab === 'referral') {
        setReferral(await usersApi.getReferral());
      }
    } catch (err) {
      console.warn('[Profile] Tab data error:', activeTab, err);
    }
  }, [activeTab, studioId]);

  useFocusEffect(useCallback(() => { loadTabData(); }, [loadTabData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTabData();
    setRefreshing(false);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMsg('');
    try {
      const updated = await usersApi.updateProfile({
        jmeno: editJmeno,
        prijmeni: editPrijmeni,
        telefon: editTelefon,
        avatar: editAvatar,
      });
      refreshUser(updated);
      setMsg('Profil uložen');
      setMsgType('success');
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Nepodařilo se uložit');
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!referral?.code) return;
    await Share.share({
      message: `Přidej se ke mně v BEDR! Použij můj referral kód: ${referral.code}`,
    });
  };

  const handleConsentChange = async (val: boolean) => {
    setConsent(val);
    try { await usersApi.updateConsent(val); } catch {}
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'info':
        return (
          <Card>
            <AvatarPicker selected={editAvatar} onSelect={setEditAvatar} />
            <Input label="Jméno" value={editJmeno} onChangeText={setEditJmeno} />
            <Input label="Příjmení" value={editPrijmeni} onChangeText={setEditPrijmeni} />
            <Input label="Telefon" value={editTelefon} onChangeText={setEditTelefon} keyboardType="phone-pad" />
            <Alert message={msg} type={msgType} visible={!!msg} onDismiss={() => setMsg('')} />
            <Button title="Uložit změny" onPress={handleSaveProfile} loading={saving} fullWidth />
          </Card>
        );

      case 'purchases':
        return purchases.length === 0
          ? <Card><Text style={s.emptyText}>Žádné nákupy</Text></Card>
          : purchases.map(p => (
            <Card key={p.id} style={s.itemCard}>
              <Text style={s.itemTitle}>{p.package_name}</Text>
              <Text style={s.itemMeta}>
                {p.lessons_remaining}/{p.lessons_total} lekcí • {p.payment_status === 'paid' ? 'Zaplaceno' : 'Nezaplaceno'}
              </Text>
              <Text style={s.itemDate}>Platnost: {new Date(p.valid_until).toLocaleDateString('cs-CZ')}</Text>
            </Card>
          ));

      case 'lessons':
        return reservations.length === 0
          ? <Card><Text style={s.emptyText}>Žádné lekce</Text></Card>
          : reservations.map(r => (
            <Card key={r.id} style={s.itemCard}>
              <View style={s.lessonRow}>
                <Text style={s.itemTitle}>{formatDT(r.slot_datetime)}</Text>
                {r.completed ? <Text style={s.doneBadge}>✓</Text> : null}
              </View>
              <Text style={s.itemMeta}>{r.package_name} • {r.lt_code === 'B' ? '60 min' : '30 min'}</Text>
            </Card>
          ));

      case 'badges':
        return badges.length === 0
          ? <Card><Text style={s.emptyText}>Zatím žádné odznaky</Text></Card>
          : badges.map(b => (
            <Card key={b.id} style={s.badgeCard}>
              <Text style={s.badgeIcon}>{b.icon}</Text>
              <View style={s.badgeInfo}>
                <Text style={s.badgeName}>{b.name}</Text>
                <Text style={s.badgeDesc}>{b.description}</Text>
                <View style={s.progressBg}>
                  <View style={[s.progressFill, { width: `${Math.min(100, Math.round((b.progress / b.target) * 100))}%` }]} />
                </View>
                <Text style={s.badgeProgress}>{b.progress} / {b.target}</Text>
              </View>
            </Card>
          ));

      case 'offers':
        return offers.length === 0
          ? <Card><Text style={s.emptyText}>Žádné nabídky</Text></Card>
          : offers.map(o => (
            <Card key={o.id} style={s.itemCard}>
              <Text style={s.itemTitle}>{o.title}</Text>
              <Text style={s.itemMeta}>{o.description}</Text>
              <Text style={s.offerDiscount}>-{o.discount_percent}%</Text>
            </Card>
          ));

      case 'referral':
        return (
          <Card>
            <Text style={s.refCode}>{referral?.code || '...'}</Text>
            <Text style={s.refLabel}>Váš referral kód</Text>
            {referral && (
              <View style={s.refStats}>
                <View style={s.refStat}><Text style={s.refNum}>{referral.total_referred}</Text><Text style={s.refStatLabel}>Pozváno</Text></View>
                <View style={s.refStat}><Text style={s.refNum}>{referral.successful}</Text><Text style={s.refStatLabel}>Úspěšných</Text></View>
                <View style={s.refStat}><Text style={s.refNum}>{referral.rewards_earned}</Text><Text style={s.refStatLabel}>Odměn</Text></View>
              </View>
            )}
            <Button title="Sdílet kód" onPress={handleShare} fullWidth style={{ marginTop: spacing.lg }} />
          </Card>
        );

      case 'consent':
        return (
          <Card>
            <View style={s.consentRow}>
              <Text style={s.consentText}>Souhlasím se zpracováním osobních údajů</Text>
              <Switch
                value={consent}
                onValueChange={handleConsentChange}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={consent ? colors.primary : '#f4f3f4'}
              />
            </View>
          </Card>
        );
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={s.profileHeader}>
        <Avatar avatar={user?.avatar || null} size={56} />
        <View style={s.profileInfo}>
          <Text style={s.profileName}>{user?.jmeno} {user?.prijmeni}</Text>
          <Text style={s.profileEmail}>{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={s.logoutBtn}>
          <Text style={s.logoutText}>Odhlásit</Text>
        </TouchableOpacity>
      </View>

      {/* Tab pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabBar}>
        <View style={s.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[s.tabPill, activeTab === tab.key && s.tabPillActive]}
            >
              <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Tab content */}
      <ScrollView
        style={s.content}
        contentContainerStyle={s.contentInner}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {renderTab()}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },

  // Profile header
  profileHeader: {
    flexDirection: 'row', alignItems: 'center', padding: spacing.lg,
    backgroundColor: colors.card, gap: spacing.md,
  },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: fonts.semiBold, fontSize: 17, color: colors.text },
  profileEmail: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted },
  logoutBtn: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  logoutText: { fontFamily: fonts.medium, fontSize: 13, color: colors.danger },

  // Tabs
  tabBar: { backgroundColor: colors.card, maxHeight: 48 },
  tabRow: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  tabPill: {
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.full, backgroundColor: colors.bg,
  },
  tabPillActive: { backgroundColor: colors.primary },
  tabText: { fontFamily: fonts.medium, fontSize: 13, color: colors.muted },
  tabTextActive: { color: colors.white },

  // Content
  content: { flex: 1 },
  contentInner: { padding: spacing.lg },

  // Common items
  emptyText: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, textAlign: 'center' },
  itemCard: { marginBottom: spacing.md },
  itemTitle: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  itemMeta: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, marginTop: 2 },
  itemDate: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 4 },

  // Lessons
  lessonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  doneBadge: { fontSize: 18, color: colors.success },

  // Badges
  badgeCard: { flexDirection: 'row', marginBottom: spacing.md, gap: spacing.md },
  badgeIcon: { fontSize: 36 },
  badgeInfo: { flex: 1 },
  badgeName: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.text },
  badgeDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: 2 },
  progressBg: { height: 5, backgroundColor: colors.border, borderRadius: 3, marginTop: spacing.sm },
  progressFill: { height: 5, backgroundColor: colors.primary, borderRadius: 3 },
  badgeProgress: { fontFamily: fonts.regular, fontSize: 11, color: colors.muted, marginTop: 2 },

  // Offers
  offerDiscount: { fontFamily: fonts.bold, fontSize: 18, color: colors.success, marginTop: spacing.sm },

  // Referral
  refCode: { fontFamily: fonts.headingBold, fontSize: 28, color: colors.primary, textAlign: 'center' },
  refLabel: { fontFamily: fonts.regular, fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: spacing.lg },
  refStats: { flexDirection: 'row', justifyContent: 'space-around' },
  refStat: { alignItems: 'center' },
  refNum: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  refStatLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },

  // Consent
  consentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  consentText: { fontFamily: fonts.regular, fontSize: 14, color: colors.text, flex: 1 },
});

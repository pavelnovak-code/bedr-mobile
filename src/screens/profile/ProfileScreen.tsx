import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Share,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useStudio } from '../../context/StudioContext';
import * as usersApi from '../../api/users';
import { getMyPurchases } from '../../api/purchases';
import { getMyReservations } from '../../api/reservations';
import { Purchase, Reservation, Badge, Offer, ReferralInfo, ReferralStats } from '../../api/types';
import Avatar from '../../components/common/Avatar';
import AvatarPicker from '../../components/common/AvatarPicker';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, spacing, radius, gradients } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';
import { formatDT } from '../../utils/dateFormat';

type TabKey = 'info' | 'purchases' | 'lessons' | 'badges' | 'offers' | 'referral' | 'consent';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'info', label: 'Profil' },
  { key: 'purchases', label: 'Nákupy' },
  { key: 'lessons', label: 'Lekce' },
  { key: 'badges', label: 'Odznaky' },
  { key: 'offers', label: 'Nabídky' },
  { key: 'referral', label: 'Pozvi kamaráda' },
  { key: 'consent', label: 'GDPR' },
];

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth();
  const { studioId } = useStudio();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [refreshing, setRefreshing] = useState(false);

  // Profile info
  const [editJmeno, setEditJmeno] = useState(user?.jmeno || '');
  const [editPrijmeni, setEditPrijmeni] = useState(user?.prijmeni || '');
  const [editTelefon, setEditTelefon] = useState(user?.telefon || '');
  const [editAvatar, setEditAvatar] = useState(user?.avatar || 'avatar:1');
  const [localPhotoUri, setLocalPhotoUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  // Data
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [consentMarketing, setConsentMarketing] = useState(!!user?.consent_marketing);
  const [consentSystem, setConsentSystem] = useState(!!user?.consent_system);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSending, setInviteSending] = useState(false);
  const [inviteMsg, setInviteMsg] = useState('');
  const [inviteMsgType, setInviteMsgType] = useState<'success' | 'error'>('success');

  // Sync consent stavu s user objektem (načte se async z profilu)
  useEffect(() => {
    if (user) {
      setConsentMarketing(!!user.consent_marketing);
      setConsentSystem(!!user.consent_system);
    }
  }, [user]);

  const handleCopyPromoCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

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
        const list = Array.isArray(raw) ? raw : (raw as any)?.badges || [];
        setBadges(list);
      } else if (activeTab === 'offers') {
        const raw = await usersApi.getOffers();
        setOffers(Array.isArray(raw) ? raw : []);
      } else if (activeTab === 'referral') {
        const [info, stats] = await Promise.all([
          usersApi.getReferralInfo().catch(() => null),
          usersApi.getReferralStats().catch(() => null),
        ]);
        setReferralInfo(info);
        setReferralStats(stats);
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

  const handlePickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setLocalPhotoUri(result.assets[0].uri);
      setEditAvatar('upload:photo'); // signalizuje že se uploadne fotka
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setMsg('');
    try {
      let avatarValue = editAvatar;

      // Upload fotky pokud byla vybrána
      if (localPhotoUri && editAvatar === 'upload:photo') {
        const formData = new FormData();
        formData.append('photo', {
          uri: localPhotoUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);
        const uploadResult = await usersApi.uploadAvatar(formData);
        avatarValue = uploadResult.avatar;
        setLocalPhotoUri(null);
      }

      const updated = await usersApi.updateProfile({
        jmeno: editJmeno,
        prijmeni: editPrijmeni,
        telefon: editTelefon,
        avatar: avatarValue,
      });
      setEditAvatar(updated.avatar || avatarValue);
      refreshUser(updated);
      setMsg('Profil uložen');
      setMsgType('success');
    } catch (e: any) {
      console.warn('[Profile] Save error:', e.response?.status, e.response?.data, e.message);
      const serverMsg = e.response?.data?.error
        || (typeof e.response?.data === 'string' ? e.response.data : null)
        || e.message
        || 'Nepodařilo se uložit';
      setMsg(serverMsg);
      setMsgType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!referralInfo?.referral_code) return;
    await Share.share({
      message: `Přidej se ke mně v BEDR! Použij můj referral kód: ${referralInfo.referral_code}`,
    });
  };

  const handleConsentMarketingChange = async (val: boolean) => {
    setConsentMarketing(val);
    try { await usersApi.updateConsent({ consent_marketing: val }); } catch {}
  };

  const handleConsentSystemChange = async (val: boolean) => {
    setConsentSystem(val);
    try { await usersApi.updateConsent({ consent_system: val }); } catch {}
  };

  const handleSendInvite = async () => {
    const email = inviteEmail.trim();
    if (!email) return;
    setInviteSending(true);
    setInviteMsg('');
    try {
      await usersApi.sendReferralInvite(email);
      setInviteMsg('Pozvánka odeslána!');
      setInviteMsgType('success');
      setInviteEmail('');
    } catch (e: any) {
      const errMsg = e.response?.data?.error || e.message || 'Nepodařilo se odeslat';
      setInviteMsg(errMsg);
      setInviteMsgType('error');
    } finally {
      setInviteSending(false);
    }
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'info':
        return (
          <Card>
            <AvatarPicker
              selected={editAvatar}
              onSelect={(val) => { setEditAvatar(val); setLocalPhotoUri(null); }}
              onPickPhoto={handlePickPhoto}
              localPhotoUri={localPhotoUri}
            />
            <Input label="Jméno" value={editJmeno} onChangeText={setEditJmeno} />
            <Input label="Příjmení" value={editPrijmeni} onChangeText={setEditPrijmeni} />
            <Input label="Telefon" value={editTelefon} onChangeText={setEditTelefon} keyboardType="phone-pad" />
            <Alert message={msg} type={msgType} visible={!!msg} onDismiss={() => setMsg('')} />
            <Button title="Uložit změny" onPress={handleSaveProfile} loading={saving} fullWidth />

            {/* Dark mode toggle */}
            <View style={[s.darkModeSection, { borderTopColor: colors.border }]}>
              <Text style={[s.darkModeLabel, { color: colors.text }]}>Tmavý režim</Text>
              <View style={s.darkModeOptions}>
                {(['light', 'dark', 'system'] as const).map(mode => (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      s.darkModePill,
                      { backgroundColor: colors.card },
                      themeMode === mode && { backgroundColor: colors.primary },
                    ]}
                    onPress={() => setThemeMode(mode)}
                  >
                    <Text style={[
                      s.darkModePillText,
                      { color: colors.muted },
                      themeMode === mode && { color: colors.white },
                    ]}>
                      {mode === 'light' ? '☀️ Světlý' : mode === 'dark' ? '🌙 Tmavý' : '⚙️ Systém'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>
        );

      case 'purchases':
        return purchases.length === 0
          ? <Card><Text style={[s.emptyText, { color: colors.muted }]}>Žádné nákupy</Text></Card>
          : purchases.map(p => {
            const remaining = p.lessons_remaining || 0;
            const isGift = p.payment_method === 'bonus';
            const statusLabel = p.pkg_status === 'expired' ? 'Prošlá platnost'
              : p.pkg_status === 'exhausted' ? 'Vyčerpané' : 'Aktivní';
            const statusColor = p.pkg_status === 'expired' ? colors.danger
              : p.pkg_status === 'exhausted' ? colors.muted : colors.success;
            let validityText = '';
            if (p.validity_end) {
              validityText = `Platnost do: ${new Date(p.validity_end).toLocaleDateString('cs-CZ')}`;
            } else if (p.validity_weeks && p.validity_weeks > 0) {
              validityText = `Platnost: ${p.validity_weeks} týdnů od první lekce`;
            }
            const paid = p.payment_status === 'paid';
            return (
              <Card key={p.id} style={[s.itemCard, p.pkg_status !== 'active' && s.itemCardInactive]}>
                <View style={s.purchaseHeader}>
                  <Text style={[s.itemTitle, { color: colors.text }]}>{p.package_name}</Text>
                  <View style={[s.statusBadge, { backgroundColor: statusColor + '20' }]}>
                    <Text style={[s.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
                  </View>
                </View>
                {isGift && (
                  <View style={[s.giftBadge, { backgroundColor: isDark ? 'rgba(245,166,35,0.15)' : '#fef3c7' }]}>
                    <Text style={[s.giftBadgeText, { color: isDark ? colors.accent : '#92400e' }]}>
                      🎁 Dárek{p.referred_friend_name ? ` za doporučení ${p.referred_friend_name}` : ''}
                    </Text>
                  </View>
                )}
                <Text style={[s.itemMeta, { color: colors.muted }]}>
                  Zbývá lekcí: {remaining} • {isGift ? '🎁 Dárek' : paid ? 'Zaplaceno' : 'Nezaplaceno'}
                </Text>
                {validityText ? <Text style={[s.itemDate, { color: colors.muted }]}>{validityText}</Text> : null}
              </Card>
            );
          });

      case 'lessons':
        return reservations.length === 0
          ? <Card><Text style={[s.emptyText, { color: colors.muted }]}>Žádné lekce</Text></Card>
          : reservations.map(r => (
            <Card key={r.id} style={s.itemCard}>
              <View style={s.lessonRow}>
                <Text style={[s.itemTitle, { color: colors.text }]}>{formatDT(r.slot_datetime)}</Text>
                {r.completed ? <Text style={[s.doneBadge, { color: colors.success }]}>✓</Text> : null}
              </View>
              <Text style={[s.itemMeta, { color: colors.muted }]}>{r.package_name} • {r.lt_code === 'B' ? '60 min' : '30 min'}</Text>
            </Card>
          ));

      case 'badges':
        return badges.length === 0
          ? <Card><Text style={[s.emptyText, { color: colors.muted }]}>Zatím žádné odznaky</Text></Card>
          : badges.map(b => {
            const pct = b.progress_total > 0
              ? Math.min(100, Math.round((b.progress_current / b.progress_total) * 100))
              : 0;
            return (
              <Card key={b.id} style={s.badgeCard}>
                <Text style={s.badgeIcon}>{b.emoji}</Text>
                <View style={s.badgeInfo}>
                  <Text style={[s.badgeName, { color: colors.text }, b.earned && { color: colors.success }]}>
                    {b.name} {b.earned ? '✓' : ''}
                  </Text>
                  <Text style={[s.badgeDesc, { color: colors.muted }]}>{b.description}</Text>
                  <View style={[s.progressBg, { backgroundColor: colors.border }]}>
                    <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: b.earned ? colors.success : colors.primary }]} />
                  </View>
                  <Text style={[s.badgeProgress, { color: colors.muted }]}>{b.progress_current} / {b.progress_total}</Text>
                </View>
              </Card>
            );
          });

      case 'offers':
        return offers.length === 0
          ? <Card><Text style={[s.emptyText, { color: colors.muted }]}>Žádné nabídky</Text></Card>
          : offers.map(o => {
            let discountText = '';
            if (o.discount_type === 'percent') discountText = `-${o.discount_value}%`;
            else if (o.discount_type === 'fixed') discountText = `-${o.discount_value} Kč`;
            else if (o.discount_type === 'free_package') discountText = 'Zdarma';
            return (
              <Card key={o.id} style={s.itemCard}>
                <Text style={[s.itemTitle, { color: colors.text }]}>{o.title}</Text>
                <Text style={[s.itemMeta, { color: colors.muted }]}>{o.perex}</Text>
                {o.promo_code && (
                  <TouchableOpacity
                    style={[s.promoCodeRow, { backgroundColor: colors.primaryLight }]}
                    onPress={() => handleCopyPromoCode(o.promo_code!)}
                    activeOpacity={0.7}
                  >
                    <Text style={[s.promoCode, { color: colors.primary }]}>Kód: {o.promo_code}</Text>
                    <Text style={[s.copyBtn, { color: colors.primaryDark }]}>
                      {copiedCode === o.promo_code ? '✓ Zkopírováno' : '📋 Kopírovat'}
                    </Text>
                  </TouchableOpacity>
                )}
                {discountText ? <Text style={[s.offerDiscount, { color: colors.success }]}>{discountText}</Text> : null}
                {o.redeemed_at && <Text style={[s.redeemedText, { color: colors.success }]}>Uplatněno</Text>}
              </Card>
            );
          });

      case 'referral':
        return (
          <>
            {/* Kód */}
            <Card>
              <Text style={[s.refHeading, { color: colors.text }]}>Váš kód pro pozvání</Text>
              <TouchableOpacity
                onPress={() => referralInfo?.referral_code && handleCopyPromoCode(referralInfo.referral_code)}
                activeOpacity={0.7}
                style={[s.refCodeBox, { backgroundColor: colors.primaryLight }]}
              >
                <Text style={[s.refCode, { color: colors.primary }]}>{referralInfo?.referral_code || '...'}</Text>
                <Text style={[s.refCopyHint, { color: colors.primaryDark }]}>
                  {copiedCode === referralInfo?.referral_code ? '✓ Zkopírováno' : '📋 Kopírovat'}
                </Text>
              </TouchableOpacity>
              {referralStats && (
                <View style={s.refStats}>
                  <View style={s.refStat}>
                    <Text style={[s.refNum, { color: colors.text }]}>{referralStats.invites_sent}</Text>
                    <Text style={[s.refStatLabel, { color: colors.muted }]}>Pozváno</Text>
                  </View>
                  <View style={s.refStat}>
                    <Text style={[s.refNum, { color: colors.text }]}>{referralStats.completed}</Text>
                    <Text style={[s.refStatLabel, { color: colors.muted }]}>Úspěšných</Text>
                  </View>
                  <View style={s.refStat}>
                    <Text style={[s.refNum, { color: colors.text }]}>{referralStats.rewards}</Text>
                    <Text style={[s.refStatLabel, { color: colors.muted }]}>Odměn</Text>
                  </View>
                </View>
              )}
              <Button title="Sdílet kód" onPress={handleShare} fullWidth style={{ marginTop: spacing.lg }} />
            </Card>

            {/* Pozvat emailem */}
            <Card style={{ marginTop: spacing.md }}>
              <Text style={[s.refHeading, { color: colors.text }]}>Pozvat e-mailem</Text>
              <Input
                placeholder="E-mail kamaráda"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {inviteMsg ? (
                <Text style={[s.inviteMsg, inviteMsgType === 'error' ? { color: colors.danger } : { color: colors.success }]}>
                  {inviteMsg}
                </Text>
              ) : null}
              <Button
                title="Odeslat pozvánku"
                onPress={handleSendInvite}
                loading={inviteSending}
                fullWidth
                style={{ marginTop: spacing.sm }}
              />
            </Card>
          </>
        );

      case 'consent':
        return (
          <Card>
            <Text style={[s.consentHeading, { color: colors.text }]}>Správa souhlasů</Text>
            <View style={s.consentRow}>
              <Text style={[s.consentText, { color: colors.text }]}>Marketingová komunikace</Text>
              <Switch
                value={consentMarketing}
                onValueChange={handleConsentMarketingChange}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={consentMarketing ? colors.primary : '#f4f3f4'}
              />
            </View>
            <Text style={[s.consentDesc, { color: colors.muted }]}>E-maily o novinkách, akcích a speciálních nabídkách</Text>
            <View style={[s.consentRow, { marginTop: spacing.lg }]}>
              <Text style={[s.consentText, { color: colors.text }]}>Systémová oznámení</Text>
              <Switch
                value={consentSystem}
                onValueChange={handleConsentSystemChange}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={consentSystem ? colors.primary : '#f4f3f4'}
              />
            </View>
            <Text style={[s.consentDesc, { color: colors.muted }]}>Připomínky lekcí, změny v rozvrhu, informace o účtu</Text>
            {user?.gdpr_souhlas ? (
              <Text style={[s.consentGdpr, { color: colors.success }]}>
                Souhlas se zpracováním osobních údajů udělen{user.gdpr_datum ? ` dne ${new Date(user.gdpr_datum).toLocaleDateString('cs-CZ')}` : ''}
              </Text>
            ) : null}
          </Card>
        );
    }
  };

  return (
    <SafeAreaView style={[s.safe, { backgroundColor: colors.bg }]} edges={['bottom', 'left', 'right']}>
      {/* Gradient Hero Header */}
      <LinearGradient
        colors={gradients.sport}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={s.heroHeader}
      >
        <SafeAreaView edges={['top']} style={s.heroInner}>
          <Avatar avatar={user?.avatar || null} size={64} />
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{user?.jmeno} {user?.prijmeni}</Text>
            <Text style={s.profileEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity onPress={logout} style={s.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.8)" />
            <Text style={s.logoutText}>Odhlásit</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      {/* Tab pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[s.tabBar, { backgroundColor: colors.bg }]}>
        <View style={s.tabRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[
                s.tabPill,
                { backgroundColor: colors.card },
                activeTab === tab.key && { backgroundColor: colors.primary },
              ]}
            >
              <Text style={[
                s.tabText,
                { color: colors.muted },
                activeTab === tab.key && { color: colors.white },
              ]}>
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
  safe: { flex: 1 },

  // Gradient hero header
  heroHeader: {},
  heroInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  profileInfo: { flex: 1 },
  profileName: { fontFamily: fonts.headingBold, fontSize: 20, color: '#ffffff' },
  profileEmail: { fontFamily: fonts.regular, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: radius.full,
  },
  logoutText: { fontFamily: fonts.medium, fontSize: 12, color: 'rgba(255,255,255,0.9)' },

  // Tabs
  tabBar: { backgroundColor: colors.bg, maxHeight: 48 },
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
  itemCardInactive: { opacity: 0.65 },
  purchaseHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
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
  promoCodeRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginTop: spacing.sm, backgroundColor: colors.primaryLight,
    paddingVertical: spacing.sm, paddingHorizontal: spacing.md,
    borderRadius: radius.md,
  },
  promoCode: { fontFamily: fonts.semiBold, fontSize: 15, color: colors.primary },
  copyBtn: { fontFamily: fonts.medium, fontSize: 12, color: colors.primaryDark },
  redeemedText: { fontFamily: fonts.medium, fontSize: 12, color: colors.success, marginTop: spacing.xs },

  // Referral
  refHeading: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, marginBottom: spacing.md },
  refCodeBox: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.primaryLight, padding: spacing.md, borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  refCode: { fontFamily: fonts.headingBold, fontSize: 22, color: colors.primary },
  refCopyHint: { fontFamily: fonts.medium, fontSize: 12, color: colors.primaryDark },
  inviteMsg: { fontFamily: fonts.medium, fontSize: 13, marginTop: spacing.xs },
  inviteMsgOk: { color: colors.success },
  inviteMsgErr: { color: colors.danger },
  refStats: { flexDirection: 'row', justifyContent: 'space-around' },
  refStat: { alignItems: 'center' },
  refNum: { fontFamily: fonts.bold, fontSize: 22, color: colors.text },
  refStatLabel: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted },

  // Dark mode
  darkModeSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  darkModeLabel: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.text,
    marginBottom: spacing.md,
  },
  darkModeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  darkModePill: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    backgroundColor: colors.bg,
    alignItems: 'center',
  },
  darkModePillActive: {
    backgroundColor: colors.primary,
  },
  darkModePillText: {
    fontFamily: fonts.medium,
    fontSize: 12,
    color: colors.muted,
  },
  darkModePillTextActive: {
    color: colors.white,
  },

  // Consent
  consentHeading: { fontFamily: fonts.heading, fontSize: 16, color: colors.text, marginBottom: spacing.lg },
  consentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  consentText: { fontFamily: fonts.medium, fontSize: 14, color: colors.text, flex: 1 },
  consentDesc: { fontFamily: fonts.regular, fontSize: 12, color: colors.muted, marginTop: spacing.xs },
  consentGdpr: { fontFamily: fonts.regular, fontSize: 12, color: colors.success, marginTop: spacing.xl, textAlign: 'center' },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../context/AuthContext';
import { getStudios } from '../../api/studios';
import { Studio } from '../../api/types';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import AvatarPicker from '../../components/common/AvatarPicker';
import { fonts, spacing, radius } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export default function RegisterScreen({ route }: Props) {
  const { register } = useAuth();
  const { colors } = useTheme();

  const [jmeno, setJmeno] = useState('');
  const [prijmeni, setPrijmeni] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefon, setTelefon] = useState('');
  const [avatar, setAvatar] = useState('avatar:1');
  const [studioId, setStudioId] = useState<number | null>(null);
  const [referralCode, setReferralCode] = useState(route.params?.referralCode || '');
  const [gdprConsent, setGdprConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const data = await getStudios();
        setStudios(data);
        if (data.length > 0) setStudioId(data[0].id);
      } catch {}
    })();
  }, []);

  const validate = (): string | null => {
    if (!jmeno.trim()) return 'Vyplňte jméno';
    if (!prijmeni.trim()) return 'Vyplňte příjmení';
    if (!email.trim()) return 'Vyplňte email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Neplatný email';
    if (password.length < 6) return 'Heslo musí mít alespoň 6 znaků';
    if (!telefon.trim()) return 'Vyplňte telefon';
    if (!gdprConsent) return 'Musíte souhlasit se zpracováním osobních údajů';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    try {
      await register({
        jmeno: jmeno.trim(),
        prijmeni: prijmeni.trim(),
        email: email.trim().toLowerCase(),
        password,
        telefon: telefon.trim() || undefined,
        avatar,
        studio_id: studioId || undefined,
        referral_code: referralCode.trim() || undefined,
        gdpr_souhlas: 1,
        consent_marketing: marketingConsent ? 1 : 0,
      });
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Registrace se nezdařila');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Alert message={error} visible={!!error} onDismiss={() => setError('')} />

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <AvatarPicker selected={avatar} onSelect={setAvatar} />

          <Input
            label="Jméno *"
            placeholder="Jan"
            value={jmeno}
            onChangeText={setJmeno}
            autoComplete="given-name"
          />
          <Input
            label="Příjmení *"
            placeholder="Novák"
            value={prijmeni}
            onChangeText={setPrijmeni}
            autoComplete="family-name"
          />
          <Input
            label="Email *"
            placeholder="jan@email.cz"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Heslo *"
            placeholder="Min. 6 znaků"
            value={password}
            onChangeText={setPassword}
            isPassword
          />
          <Input
            label="Telefon *"
            placeholder="+420 xxx xxx xxx"
            value={telefon}
            onChangeText={setTelefon}
            keyboardType="phone-pad"
            autoComplete="tel"
          />

          {studios.length > 1 && (
            <View style={styles.studioWrap}>
              <Text style={[styles.studioLabel, { color: colors.text }]}>Studio:</Text>
              <View style={styles.studioRow}>
                {studios.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setStudioId(s.id)}
                    style={[
                      styles.studioBtn,
                      { borderColor: colors.border, backgroundColor: colors.card },
                      s.id === studioId && { borderColor: colors.primary, backgroundColor: colors.primaryLight },
                    ]}
                  >
                    <Text style={[
                      styles.studioBtnText,
                      { color: colors.muted },
                      s.id === studioId && { color: colors.primary },
                    ]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <Input
            label="Referral kód (nepovinné)"
            placeholder="Kód od kamaráda"
            value={referralCode}
            onChangeText={setReferralCode}
          />

          <View style={styles.gdprRow}>
            <Switch
              value={gdprConsent}
              onValueChange={setGdprConsent}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
            <Text style={[styles.gdprText, { color: colors.text }]}>
              Souhlasím se zpracováním osobních údajů *
            </Text>
          </View>

          <View style={styles.gdprRow}>
            <Switch
              value={marketingConsent}
              onValueChange={setMarketingConsent}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor="#ffffff"
            />
            <Text style={[styles.gdprText, { color: colors.muted }]}>
              Souhlas s marketingovou komunikací (nepovinné)
            </Text>
          </View>

          <Button
            title="Zaregistrovat se"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
            style={{ marginTop: spacing.md }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl * 2,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  studioWrap: {
    marginBottom: spacing.lg,
  },
  studioLabel: {
    fontFamily: fonts.medium,
    fontSize: 13,
    marginBottom: spacing.sm,
  },
  studioRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  studioBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
  },
  studioBtnText: {
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  gdprRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  gdprText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 13,
  },
});

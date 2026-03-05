import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { colors, fonts, spacing, radius } from '../../config/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Vyplňte email a heslo');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await login(email.trim(), password);
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Přihlášení se nezdařilo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo / Branding */}
        <View style={styles.header}>
          <Text style={styles.logo}>BEDR</Text>
          <Text style={styles.subtitle}>Přihlášení do aplikace</Text>
        </View>

        <Alert message={error} visible={!!error} onDismiss={() => setError('')} />

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="vas@email.cz"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
          />
          <Input
            label="Heslo"
            placeholder="Vaše heslo"
            value={password}
            onChangeText={setPassword}
            isPassword
            autoComplete="password"
            onSubmitEditing={handleLogin}
          />

          <Button
            title="Přihlásit se"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.link}
          >
            <Text style={styles.linkText}>Zapomenuté heslo?</Text>
          </TouchableOpacity>
        </View>

        {/* Registrace */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Nemáte účet?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register', {})}>
            <Text style={styles.registerLink}> Zaregistrujte se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  logo: {
    fontFamily: fonts.headingBold,
    fontSize: 42,
    color: colors.primary,
    letterSpacing: 4,
  },
  subtitle: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
    marginTop: spacing.sm,
  },
  form: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
  },
  link: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  linkText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
  },
  registerLink: {
    fontFamily: fonts.semiBold,
    fontSize: 14,
    color: colors.primary,
  },
});

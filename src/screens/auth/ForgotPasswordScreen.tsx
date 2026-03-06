import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { forgotPassword } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { fonts, spacing, radius } from '../../config/theme';
import { useTheme } from '../../context/ThemeContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen({ navigation }: Props) {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError('Vyplňte email');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await forgotPassword(email.trim().toLowerCase());
      setSuccess(result.message || 'Odkaz pro reset hesla byl odeslán na váš email.');
    } catch (e: any) {
      setError(e.response?.data?.error || e.message || 'Nepodařilo se odeslat');
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
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.title, { color: colors.text }]}>Zapomenuté heslo</Text>
          <Text style={[styles.desc, { color: colors.muted }]}>
            Zadejte email, na který vám pošleme odkaz pro obnovení hesla.
          </Text>

          <Alert message={error} visible={!!error} onDismiss={() => setError('')} />
          <Alert message={success} type="success" visible={!!success} />

          <Input
            label="Email"
            placeholder="vas@email.cz"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoComplete="email"
          />

          <Button
            title="Odeslat odkaz"
            onPress={handleSubmit}
            loading={loading}
            fullWidth
            size="lg"
          />

          <Button
            title="Zpět na přihlášení"
            onPress={() => navigation.goBack()}
            variant="ghost"
            fullWidth
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.xl,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    marginBottom: spacing.sm,
  },
  desc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    marginBottom: spacing.xl,
    lineHeight: 20,
  },
});

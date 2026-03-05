import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/AuthStack';
import { resetPassword } from '../../api/auth';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { colors, fonts, spacing } from '../../config/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen({ navigation, route }: Props) {
  const token = (route.params as any)?.token || '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('error');

  const handleReset = async () => {
    if (!password || password.length < 6) {
      setMsg('Heslo musí mít alespoň 6 znaků');
      setMsgType('error');
      return;
    }
    if (password !== passwordConfirm) {
      setMsg('Hesla se neshodují');
      setMsgType('error');
      return;
    }
    if (!token) {
      setMsg('Chybí token pro reset hesla');
      setMsgType('error');
      return;
    }

    setLoading(true);
    setMsg('');
    try {
      await resetPassword(token, password);
      setMsg('Heslo bylo úspěšně změněno! Nyní se můžete přihlásit.');
      setMsgType('success');
      setTimeout(() => navigation.navigate('Login'), 2000);
    } catch (e: any) {
      setMsg(e.response?.data?.error || 'Nepodařilo se změnit heslo');
      setMsgType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Nové heslo</Text>
        <Text style={styles.desc}>Zadejte své nové heslo.</Text>

        <Alert message={msg} type={msgType} visible={!!msg} onDismiss={() => setMsg('')} />

        <Input
          label="Nové heslo"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="Alespoň 6 znaků"
        />

        <Input
          label="Potvrzení hesla"
          value={passwordConfirm}
          onChangeText={setPasswordConfirm}
          secureTextEntry
          placeholder="Zopakujte heslo"
        />

        <Button
          title="Změnit heslo"
          onPress={handleReset}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flex: 1, backgroundColor: colors.bg },
  container: { padding: spacing.lg },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  desc: {
    fontFamily: fonts.regular,
    fontSize: 14,
    color: colors.muted,
    marginBottom: spacing.xl,
  },
});

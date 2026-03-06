import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ResetPasswordScreen from '../screens/auth/ResetPasswordScreen';
import { fonts } from '../config/theme';
import { useTheme } from '../context/ThemeContext';

export type AuthStackParamList = {
  Login: undefined;
  Register: { referralCode?: string };
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthStack() {
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.white },
        headerTintColor: colors.primary,
        headerTitleStyle: { fontFamily: fonts.heading, fontSize: 17 },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: colors.bg },
      }}
    >
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Registrace' }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{ title: 'Zapomenuté heslo' }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{ title: 'Nové heslo' }}
      />
    </Stack.Navigator>
  );
}

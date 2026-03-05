import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import Spinner from '../components/common/Spinner';

// Deep linking konfigurace
const linking = {
  prefixes: ['bedr://', 'https://app.bedr.cz'],
  config: {
    screens: {
      // Auth flow
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'forgot-password',
      ResetPassword: 'reset-password',
      // Main tabs (po přihlášení)
      Dashboard: 'dashboard',
      Booking: 'book',
      Profile: 'profile',
    },
  },
};

export default function RootNavigator() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return <Spinner fullScreen message="Načítám..." />;
  }

  return (
    <NavigationContainer linking={linking}>
      {isLoggedIn ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { StudioProvider } from './src/context/StudioContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { colors } from './src/config/theme';

// Splash screen zůstane viditelná dokud se fonty nenačtou
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    'BedrInter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'BedrInter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'BedrInter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
    'BedrInter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'BedrPoppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'BedrPoppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="dark" />
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <StudioProvider>
              <RootNavigator />
            </StudioProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});

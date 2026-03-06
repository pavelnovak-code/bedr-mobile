import React, { useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { StudioProvider } from './src/context/StudioContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';

// Splash screen zůstane viditelná dokud se fonty nenačtou
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    'BedrInter-Regular': require('./assets/fonts/Inter-Regular.ttf'),
    'BedrInter-Medium': require('./assets/fonts/Inter-Medium.ttf'),
    'BedrInter-SemiBold': require('./assets/fonts/Inter-SemiBold.ttf'),
    'BedrInter-Bold': require('./assets/fonts/Inter-Bold.ttf'),
    'BedrPoppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
    'BedrPoppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root} onLayout={onLayoutRootView}>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <StudioProvider>
              <StatusBar style="auto" />
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
  },
});

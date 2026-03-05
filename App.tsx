import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { StudioProvider } from './src/context/StudioContext';
import RootNavigator from './src/navigation/RootNavigator';
import ErrorBoundary from './src/components/common/ErrorBoundary';
import { colors } from './src/config/theme';

export default function App() {
  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ErrorBoundary>
        <AuthProvider>
          <StudioProvider>
            <RootNavigator />
          </StudioProvider>
        </AuthProvider>
      </ErrorBoundary>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});

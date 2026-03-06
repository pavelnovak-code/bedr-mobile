import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { lightColors as colors, fonts, spacing } from '../../config/theme';

// ErrorBoundary je class component — nemůže použít hooks (useTheme).
// Používá lightColors jako fallback (error boundary se zobrazí vzácně).

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.icon}>😵</Text>
          <Text style={styles.title}>Něco se pokazilo</Text>
          <Text style={styles.message}>
            Omlouváme se, v aplikaci došlo k neočekávané chybě.
          </Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Zkusit znovu</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: fonts.headingBold,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  message: {
    fontFamily: fonts.regular,
    fontSize: 15,
    color: colors.muted,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  buttonText: {
    fontFamily: fonts.semiBold,
    fontSize: 15,
    color: colors.white,
  },
});

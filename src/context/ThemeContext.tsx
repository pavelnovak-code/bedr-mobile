import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorScheme } from '../config/theme';

interface ThemeContextType {
  colors: ColorScheme;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  themeMode: 'light' | 'dark' | 'system';
}

const THEME_KEY = 'bedr_theme_mode';

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  // Fallback: čti přímo z Appearance API pokud hook vrací null
  const [systemDark, setSystemDark] = useState<boolean>(
    (systemScheme ?? Appearance.getColorScheme()) === 'dark'
  );
  const [themeMode, setThemeModeState] = useState<'light' | 'dark' | 'system'>('system');

  // Sleduj změny systémového scheme přes Appearance listener
  useEffect(() => {
    setSystemDark((systemScheme ?? Appearance.getColorScheme()) === 'dark');
  }, [systemScheme]);

  useEffect(() => {
    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      console.log('[Theme] System scheme changed:', colorScheme);
      setSystemDark(colorScheme === 'dark');
    });
    return () => sub.remove();
  }, []);

  // Načti uloženou preferenci
  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(val => {
      if (val === 'light' || val === 'dark' || val === 'system') {
        setThemeModeState(val);
      }
    });
  }, []);

  const isDark =
    themeMode === 'dark' ? true
    : themeMode === 'light' ? false
    : systemDark;

  const colors = isDark ? darkColors : lightColors;

  const setThemeMode = useCallback((mode: 'light' | 'dark' | 'system') => {
    setThemeModeState(mode);
    AsyncStorage.setItem(THEME_KEY, mode);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setThemeMode(next);
  }, [isDark, setThemeMode]);

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme, setThemeMode, themeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthResponse } from '../api/types';
import * as authApi from '../api/auth';
import { getProfile } from '../api/users';
import { getToken, setToken, clearAuth, clearPin, setBiometricEnabled, parseJwtPayload } from '../utils/storage';
import { setUnauthorizedHandler } from '../api/client';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean; // true během ověřování tokenu při startu
  isLoggedIn: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (payload: Parameters<typeof authApi.register>[0]) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<AuthResponse>;
  loginWithMeta: (accessToken: string) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  setAuthData: (data: AuthResponse) => Promise<void>;
  refreshUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isLoggedIn: false,
  });

  // Stáhne plný profil ze serveru a aktualizuje user state
  const fetchProfile = useCallback(async () => {
    try {
      const profile = await getProfile();
      setState(s => ({ ...s, user: profile }));
    } catch (err) {
      console.warn('[Auth] Nepodařilo se načíst profil:', err);
    }
  }, []);

  // Při startu apky zkontroluj uložený token (BEZ kontroly expirace —
  // server vrátí 401 pokud je neplatný, app se neodhlašuje při zavření)
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await getToken();
        if (savedToken) {
          const payload = parseJwtPayload(savedToken);
          // Token existuje → přihlas uživatele lokálně (server ověří při API callech)
          setState({
            user: payload as unknown as User,
            token: savedToken,
            isLoading: false,
            isLoggedIn: true,
          });
          return;
        }
      } catch {
        // Token nelze přečíst → pokračuj jako nepřihlášený
      }
      setState(s => ({ ...s, isLoading: false }));
    })();
  }, []);

  // Registruj handler pro 401 (expired token) z API clienta
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setState({ user: null, token: null, isLoading: false, isLoggedIn: false });
    });
  }, []);

  // Jakmile je uživatel přihlášen, stáhni plný profil
  useEffect(() => {
    if (state.isLoggedIn && state.token) {
      fetchProfile();
    }
  }, [state.isLoggedIn, state.token, fetchProfile]);

  const setAuthData = useCallback(async (data: AuthResponse) => {
    await setToken(data.token);
    setState({
      user: data.user,
      token: data.token,
      isLoading: false,
      isLoggedIn: true,
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    await setAuthData(data);
  }, [setAuthData]);

  const register = useCallback(async (payload: Parameters<typeof authApi.register>[0]) => {
    const data = await authApi.register(payload);
    await setAuthData(data);
  }, [setAuthData]);

  const loginWithGoogle = useCallback(async (idToken: string) => {
    const data = await authApi.googleLogin(idToken);
    await setAuthData(data);
    return data;
  }, [setAuthData]);

  const loginWithMeta = useCallback(async (accessToken: string) => {
    const data = await authApi.metaLogin(accessToken);
    await setAuthData(data);
    return data;
  }, [setAuthData]);

  const logout = useCallback(async () => {
    await clearAuth();
    await clearPin();
    await setBiometricEnabled(false);
    setState({
      user: null,
      token: null,
      isLoading: false,
      isLoggedIn: false,
    });
  }, []);

  const refreshUser = useCallback((user: User) => {
    setState(s => ({ ...s, user }));
  }, []);

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      loginWithGoogle,
      loginWithMeta,
      logout,
      setAuthData,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

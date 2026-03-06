import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'bedr_jwt_token';
const STUDIO_KEY = 'bedr_studio_id';

// ── JWT Token (šifrované úložiště) ──────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearAuth(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

// ── Studio ID (AsyncStorage) ────────────────────────────────────────────────

export async function getStudioId(): Promise<number | null> {
  try {
    const val = await AsyncStorage.getItem(STUDIO_KEY);
    return val ? parseInt(val, 10) : null;
  } catch {
    return null;
  }
}

export async function setStudioId(id: number): Promise<void> {
  await AsyncStorage.setItem(STUDIO_KEY, String(id));
}

export async function clearStudioId(): Promise<void> {
  await AsyncStorage.removeItem(STUDIO_KEY);
}

// ── Tutorial overlay ────────────────────────────────────────────────────────

const TUTORIAL_KEY = 'bedr_tutorial_swipe_seen';

export async function getTutorialSeen(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(TUTORIAL_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setTutorialSeen(): Promise<void> {
  await AsyncStorage.setItem(TUTORIAL_KEY, 'true');
}

// ── PIN & Biometric ─────────────────────────────────────────────────────────

const PIN_KEY = 'bedr_user_pin';
const BIOMETRIC_KEY = 'bedr_biometric_enabled';

export async function getPinHash(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(PIN_KEY);
  } catch {
    return null;
  }
}

export async function setPinHash(hash: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, hash);
}

export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
}

export async function isPinSetup(): Promise<boolean> {
  const pin = await getPinHash();
  return !!pin;
}

export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(BIOMETRIC_KEY);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(BIOMETRIC_KEY, enabled ? 'true' : 'false');
}

// ── Parse JWT payload ───────────────────────────────────────────────────────

export function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1];
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

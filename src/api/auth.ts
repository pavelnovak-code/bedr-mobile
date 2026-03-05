import apiClient from './client';
import { endpoints } from '../config/api';
import { AuthResponse } from './types';

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await apiClient.post(endpoints.login, { email, password });
  return data;
}

export async function register(payload: {
  jmeno: string;
  prijmeni: string;
  email: string;
  password: string;
  telefon?: string;
  avatar?: string;
  studio_id?: number;
  referral_code?: string;
  gdpr_consent: boolean;
}): Promise<AuthResponse> {
  const { data } = await apiClient.post(endpoints.register, payload);
  return data;
}

export async function googleLogin(idToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post(endpoints.googleLogin, { id_token: idToken });
  return data;
}

export async function metaLogin(accessToken: string): Promise<AuthResponse> {
  const { data } = await apiClient.post(endpoints.metaLogin, { access_token: accessToken });
  return data;
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  const { data } = await apiClient.post(endpoints.forgotPassword, { email });
  return data;
}

export async function resetPassword(token: string, password: string): Promise<{ message: string }> {
  const { data } = await apiClient.post(endpoints.resetPassword, { token, password });
  return data;
}

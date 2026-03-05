import apiClient from './client';
import { endpoints } from '../config/api';
import { User, Badge, Offer, ReferralInfo, ReferralStats } from './types';

export async function getProfile(): Promise<User> {
  const { data } = await apiClient.get(endpoints.profile);
  return data;
}

export async function updateProfile(payload: {
  jmeno?: string;
  prijmeni?: string;
  telefon?: string;
  avatar?: string;
}): Promise<User> {
  const { data } = await apiClient.put(endpoints.updateProfile, payload);
  return data;
}

export async function uploadAvatar(formData: FormData): Promise<{ avatar: string }> {
  const { data } = await apiClient.post(endpoints.uploadAvatar, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updateAvatar(avatar: string): Promise<{ avatar: string }> {
  const { data } = await apiClient.put(endpoints.updateAvatar, { avatar });
  return data;
}

export async function savePushToken(token: string): Promise<void> {
  await apiClient.put(endpoints.pushToken, { push_token: token });
}

export async function getOffers(): Promise<Offer[]> {
  const { data } = await apiClient.get(endpoints.myOffers);
  return data;
}

export async function getReferralInfo(): Promise<ReferralInfo> {
  const { data } = await apiClient.get(endpoints.referral);
  return data;
}

export async function getReferralStats(): Promise<ReferralStats> {
  const { data } = await apiClient.get(endpoints.referralStats);
  return data;
}

export async function getBadges(): Promise<Badge[]> {
  const { data } = await apiClient.get(endpoints.badges);
  return data;
}

export async function updateConsent(consent: boolean): Promise<void> {
  await apiClient.put(endpoints.gdprConsent, { gdpr_consent: consent });
}

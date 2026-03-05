import apiClient from './client';
import { endpoints } from '../config/api';
import { Purchase } from './types';

export async function getMyPurchases(studioId: number): Promise<Purchase[]> {
  const { data } = await apiClient.get(endpoints.myPurchases, {
    params: { studio_id: studioId },
  });
  return data;
}

export async function createPurchase(payload: {
  package_id: number;
  studio_id: number;
  promo_code?: string;
}): Promise<Purchase> {
  const { data } = await apiClient.post(endpoints.createPurchase, payload);
  return data;
}

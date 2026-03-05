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
  start_datetime?: string;
  payment_method?: string;
  promo_code?: string;
}): Promise<any> {
  const body = {
    ...payload,
    payment_method: payload.payment_method || 'cash',
    start_datetime: payload.start_datetime,
  };
  const { data } = await apiClient.post(endpoints.createPurchase, body);
  return data;
}

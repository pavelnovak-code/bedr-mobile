import apiClient from './client';
import { endpoints } from '../config/api';
import { PromoCodeResult } from './types';

export async function validatePromoCode(code: string, studioId: number): Promise<PromoCodeResult> {
  const { data } = await apiClient.post(endpoints.validatePromo, {
    code,
    studio_id: studioId,
  });
  return data;
}

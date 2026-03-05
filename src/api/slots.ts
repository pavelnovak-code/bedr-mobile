import apiClient from './client';
import { endpoints } from '../config/api';
import { Slot } from './types';

export async function getSlots(
  studioId: number,
  date: string,
  type?: string,
  excludeId?: number,
): Promise<Slot[]> {
  const params: Record<string, any> = { studio_id: studioId, date };
  if (type) params.type = type;
  if (excludeId) params.exclude_id = excludeId;
  const { data } = await apiClient.get(endpoints.slots, { params });
  return data;
}

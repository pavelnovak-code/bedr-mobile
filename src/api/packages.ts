import apiClient from './client';
import { endpoints } from '../config/api';
import { Package } from './types';

export async function getPackages(studioId: number): Promise<Package[]> {
  const { data } = await apiClient.get(endpoints.packages, {
    params: { studio_id: studioId },
  });
  return data;
}

import apiClient from './client';
import { endpoints } from '../config/api';
import { Studio } from './types';

export async function getStudios(): Promise<Studio[]> {
  const { data } = await apiClient.get(endpoints.studios);
  return data;
}

export async function getMyActiveStudios(): Promise<Studio[]> {
  const { data } = await apiClient.get(endpoints.myActiveStudios);
  return data;
}

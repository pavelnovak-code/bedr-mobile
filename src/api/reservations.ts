import apiClient from './client';
import { endpoints } from '../config/api';
import { Reservation } from './types';

export async function getMyReservations(studioId: number): Promise<Reservation[]> {
  const { data } = await apiClient.get(endpoints.myReservations, {
    params: { studio_id: studioId },
  });
  return data;
}

export async function bookReservation(payload: {
  purchase_id: number;
  slot_datetime: string;
  studio_id: number;
}): Promise<Reservation> {
  const { data } = await apiClient.post(endpoints.bookReservation, payload);
  return data;
}

export async function moveReservation(id: number, newSlotDatetime: string): Promise<Reservation> {
  const { data } = await apiClient.put(endpoints.moveReservation(id), {
    slot_datetime: newSlotDatetime,
  });
  return data;
}

export async function cancelReservation(id: number): Promise<void> {
  await apiClient.delete(endpoints.cancelReservation(id));
}

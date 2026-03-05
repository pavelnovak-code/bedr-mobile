import apiClient from './client';
import { endpoints } from '../config/api';
import { Slot } from './types';

export async function getSlots(studioId: number, date: string, lessonTypeId?: number): Promise<Slot[]> {
  const { data } = await apiClient.get(endpoints.slots, {
    params: { studio_id: studioId, date, lesson_type_id: lessonTypeId },
  });
  return data;
}

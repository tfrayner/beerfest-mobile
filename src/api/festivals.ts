import { apiClient } from './client';
import type { ApiListResponse, ApiFormResponse, Festival } from '@/types/api';

export async function listFestivals(): Promise<Festival[]> {
  const res = await apiClient.get<ApiListResponse<Festival>>('/festival/list');
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to list festivals');
  return res.data.objects;
}

export async function loadFestival(festivalId: number): Promise<Festival> {
  const res = await apiClient.get<ApiFormResponse<Festival>>('/festival/load_form', {
    params: { festival_id: festivalId },
  });
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to load festival');
  return res.data.data;
}

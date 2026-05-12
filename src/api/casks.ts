import { apiClient } from './client';
import type { ApiListResponse, ApiFormResponse, ApiSubmitResponse, Cask } from '@/types/api';

export async function listCasks(festivalId: number, categoryId: number): Promise<Cask[]> {
  const res = await apiClient.get<ApiListResponse<Cask>>(
    `/cask/list/${festivalId}/${categoryId}`,
  );
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to list casks');
  return res.data.objects;
}

export async function listCasksByStillage(stillageLocationId: number): Promise<Cask[]> {
  const res = await apiClient.get<ApiListResponse<Cask>>(
    `/cask/list_by_stillage/${stillageLocationId}`,
  );
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to list casks by stillage');
  return res.data.objects;
}

export async function loadCask(caskId: number): Promise<Cask> {
  const res = await apiClient.get<ApiFormResponse<Cask>>('/cask/load_form', {
    params: { cask_id: caskId },
  });
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to load cask');
  return res.data.data;
}

export async function submitCask(changes: Partial<Cask>[]): Promise<void> {
  const params = new URLSearchParams({ changes: JSON.stringify(changes) });
  const res = await apiClient.post<ApiSubmitResponse>('/cask/submit', params.toString());
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to submit cask');
}

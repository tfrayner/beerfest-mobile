import { apiClient } from './client';
import type { ApiListResponse, StillageLocation } from '@/types/api';

export async function listStillageLocations(festivalId: number): Promise<StillageLocation[]> {
  const res = await apiClient.get<ApiListResponse<StillageLocation>>(
    `/stillagelocation/list/${festivalId}`,
  );
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to list stillage locations');
  return res.data.objects;
}

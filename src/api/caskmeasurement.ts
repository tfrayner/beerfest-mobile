import { apiClient } from './client';
import type {
  ApiListResponse,
  ApiFormResponse,
  ApiSubmitResponse,
  CaskMeasurement,
  CaskDip,
} from '@/types/api';

export async function listDipsByCask(caskId: number): Promise<CaskDip[]> {
  const res = await apiClient.get<ApiListResponse<CaskDip>>(`/cask/list_dips/${caskId}`);
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to list dips');
  return res.data.objects;
}

export async function listMeasurementsByCask(caskId: number): Promise<CaskMeasurement[]> {
  const res = await apiClient.get<ApiListResponse<CaskMeasurement>>(
    `/caskmeasurement/list_by_cask/${caskId}`,
  );
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to list measurements');
  return res.data.objects;
}

export async function loadMeasurement(measurementId: number): Promise<CaskMeasurement> {
  const res = await apiClient.get<ApiFormResponse<CaskMeasurement>>(
    '/caskmeasurement/load_form',
    { params: { cask_measurement_id: measurementId } },
  );
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to load measurement');
  return res.data.data;
}

export type MeasurementSubmit = {
  cask_measurement_id?: number;
  cask_id: number;
  /** Empty string instructs the server to delete the dip record. */
  volume: number | '';
  comment?: string;
  is_vented?: boolean;
  is_tapped?: boolean;
  is_ready?: boolean;
  is_condemned?: boolean;
};

export async function submitMeasurement(changes: MeasurementSubmit[]): Promise<void> {
  const params = new URLSearchParams({ changes: JSON.stringify(changes) });
  const res = await apiClient.post<ApiSubmitResponse>('/caskmeasurement/submit', params.toString());
  if (!res.data.success) throw new Error(res.data.error ?? 'Failed to submit measurement');
}

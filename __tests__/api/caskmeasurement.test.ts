import { apiClient } from '@/api/client';
import {
  listDipsByCask,
  listMeasurementsByCask,
  loadMeasurement,
  submitMeasurement,
} from '@/api/caskmeasurement';
import type { CaskDip, CaskMeasurement } from '@/types/api';

jest.mock('@/api/client', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = apiClient.get as jest.Mock;
const mockPost = apiClient.post as jest.Mock;

const DIP: CaskDip = {
  cask_measurement_id: 1,
  measurement_time: '2026-05-01T12:00:00Z',
  volume: 40,
  container_measure: 'litres',
};

const MEASUREMENT: CaskMeasurement = {
  cask_measurement_id: 1,
  cask_id: 5,
  measurement_batch_id: 0,
  measurement_time: '2026-05-01T12:00:00Z',
  measurement_batch_name: '',
  volume: 40,
  container_measure_id: 1,
  comment: '',
};

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('listDipsByCask', () => {
  it('returns dips on success', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, objects: [DIP] } });
    const result = await listDipsByCask(5);
    expect(result).toEqual([DIP]);
    expect(mockGet).toHaveBeenCalledWith('/cask/list_dips/5');
  });

  it('throws on failure', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false, error: 'fail' } });
    await expect(listDipsByCask(5)).rejects.toThrow('fail');
  });
});

describe('listMeasurementsByCask', () => {
  it('returns measurements on success', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, objects: [MEASUREMENT] } });
    const result = await listMeasurementsByCask(5);
    expect(result).toEqual([MEASUREMENT]);
    expect(mockGet).toHaveBeenCalledWith('/caskmeasurement/list_by_cask/5');
  });

  it('throws with fallback message', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false } });
    await expect(listMeasurementsByCask(5)).rejects.toThrow('Failed to list measurements');
  });
});

describe('loadMeasurement', () => {
  it('returns measurement data on success', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: MEASUREMENT } });
    const result = await loadMeasurement(1);
    expect(result).toEqual(MEASUREMENT);
    expect(mockGet).toHaveBeenCalledWith('/caskmeasurement/load_form', {
      params: { cask_measurement_id: 1 },
    });
  });

  it('throws on failure', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false, error: 'not found' } });
    await expect(loadMeasurement(99)).rejects.toThrow('not found');
  });
});

describe('submitMeasurement', () => {
  it('posts changes and resolves on success', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true } });
    await expect(
      submitMeasurement([{ cask_id: 5, volume: 35, comment: 'ok' }]),
    ).resolves.toBeUndefined();

    const [url, body] = mockPost.mock.calls[0];
    expect(url).toBe('/caskmeasurement/submit');
    expect(body).toContain('changes=');
  });

  it('supports empty string volume (delete intent)', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true } });
    await submitMeasurement([{ cask_id: 5, volume: '' }]);

    const body = mockPost.mock.calls[0][1] as string;
    const parsed = JSON.parse(decodeURIComponent(body.replace('changes=', '')));
    expect(parsed[0].volume).toBe('');
  });

  it('throws on failure', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: false, error: 'save failed' } });
    await expect(submitMeasurement([{ cask_id: 5, volume: 10 }])).rejects.toThrow('save failed');
  });
});

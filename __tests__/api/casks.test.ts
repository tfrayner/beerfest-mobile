import { apiClient } from '@/api/client';
import { listCasks, listCasksByStillage, loadCask, submitCask, listContainerSizes } from '@/api/casks';
import type { Cask } from '@/types/api';

jest.mock('@/api/client', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = apiClient.get as jest.Mock;
const mockPost = apiClient.post as jest.Mock;

const CASK: Cask = {
  cask_id: 5,
  cask_management_id: 0,
  festival_id: 1,
  festival_name: 'Test Fest',
  gyle_id: 0,
  product_id: 0,
  product_name: 'Golden Ale',
  company_id: 0,
  company_name: 'Acme Brewery',
  bar_id: 0,
  stillage_location_id: 10,
  stillage_bay: 1,
  bay_position_id: 0,
  container_size_id: 0,
  order_batch_id: 0,
  order_batch_name: '',
  distributor_id: 0,
  currency_id: 0,
  price: '0',
  festival_ref: 'REF-001',
  int_reference: '',
  ext_reference: '',
  comment: '',
  is_vented: false,
  is_tapped: false,
  is_ready: true,
  is_condemned: false,
  is_sale_or_return: false,
  cask_graveyard: false,
  stillage_x: 0,
  stillage_y: 0,
  stillage_z: 0,
};

beforeEach(() => {
  mockGet.mockReset();
  mockPost.mockReset();
});

describe('listCasks', () => {
  it('requests the correct URL and returns casks', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, objects: [CASK] } });
    const result = await listCasks(1, 2);
    expect(result).toEqual([CASK]);
    expect(mockGet).toHaveBeenCalledWith('/cask/list/1/2');
  });

  it('throws on failure', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false, error: 'oops' } });
    await expect(listCasks(1, 2)).rejects.toThrow('oops');
  });
});

describe('listCasksByStillage', () => {
  it('requests the correct URL and returns casks', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, objects: [CASK] } });
    const result = await listCasksByStillage(10);
    expect(result).toEqual([CASK]);
    expect(mockGet).toHaveBeenCalledWith('/cask/list_by_stillage/10');
  });

  it('throws with fallback message', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false } });
    await expect(listCasksByStillage(10)).rejects.toThrow('Failed to list casks by stillage');
  });
});

describe('loadCask', () => {
  it('returns the data on success', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: CASK } });
    const result = await loadCask(5);
    expect(result).toEqual(CASK);
    expect(mockGet).toHaveBeenCalledWith('/cask/load_form', { params: { cask_id: 5 } });
  });

  it('throws on failure', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false, error: 'not found' } });
    await expect(loadCask(99)).rejects.toThrow('not found');
  });
});

describe('submitCask', () => {
  it('sends URLSearchParams with changes JSON and resolves on success', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: true } });
    await expect(submitCask([{ cask_id: 5, is_ready: false }])).resolves.toBeUndefined();

    const [url, body] = mockPost.mock.calls[0];
    expect(url).toBe('/cask/submit');
    expect(body).toContain('changes=');
    const parsed = JSON.parse(decodeURIComponent(body.replace('changes=', '')));
    expect(parsed).toEqual([{ cask_id: 5, is_ready: false }]);
  });

  it('throws on failure', async () => {
    mockPost.mockResolvedValueOnce({ data: { success: false, error: 'save failed' } });
    await expect(submitCask([{ cask_id: 5 }])).rejects.toThrow('save failed');
  });
});

describe('listContainerSizes', () => {
  it('requests the correct URL and returns container sizes', async () => {
    const sizes = [{ container_size_id: 1, volume: 72, description: 'Firkin' }];
    mockGet.mockResolvedValueOnce({ data: { success: true, objects: sizes } });
    const result = await listContainerSizes();
    expect(result).toEqual(sizes);
    expect(mockGet).toHaveBeenCalledWith('/containersize/list');
  });

  it('throws on failure', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false, error: 'not found' } });
    await expect(listContainerSizes()).rejects.toThrow('not found');
  });
});

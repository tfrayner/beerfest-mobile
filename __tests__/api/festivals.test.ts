import { apiClient } from '@/api/client';
import { listFestivals, loadFestival } from '@/api/festivals';
import { listStillageLocations } from '@/api/stillagelocation';
import { listProductCategories } from '@/api/productcategory';
import type { Festival, StillageLocation, ProductCategory } from '@/types/api';

jest.mock('@/api/client', () => ({
  apiClient: { get: jest.fn(), post: jest.fn() },
}));

const mockGet = apiClient.get as jest.Mock;

beforeEach(() => {
  mockGet.mockReset();
});

// ── Festivals ────────────────────────────────────────────────────────────────

const FESTIVAL: Festival = {
  festival_id: 1,
  year: 2026,
  name: 'Test Fest',
  description: 'A test festival',
  fst_start_date: '2026-05-01',
  fst_end_date: '2026-05-03',
};

describe('listFestivals', () => {
  it('returns the objects array on success', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, objects: [FESTIVAL] } });
    const result = await listFestivals();
    expect(result).toEqual([FESTIVAL]);
    expect(mockGet).toHaveBeenCalledWith('/festival/list');
  });

  it('throws when success is false', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false, error: 'DB error' } });
    await expect(listFestivals()).rejects.toThrow('DB error');
  });
});

describe('loadFestival', () => {
  it('returns the data object on success', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, data: FESTIVAL } });
    const result = await loadFestival(1);
    expect(result).toEqual(FESTIVAL);
    expect(mockGet).toHaveBeenCalledWith('/festival/load_form', { params: { festival_id: 1 } });
  });

  it('throws with a fallback message when error is missing', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false } });
    await expect(loadFestival(1)).rejects.toThrow('Failed to load festival');
  });
});

// ── Stillage Locations ────────────────────────────────────────────────────────

const STILLAGE: StillageLocation = {
  stillage_location_id: 10,
  festival_id: 1,
  description: 'Main Bar',
};

describe('listStillageLocations', () => {
  it('returns locations on success', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, objects: [STILLAGE] } });
    const result = await listStillageLocations(1);
    expect(result).toEqual([STILLAGE]);
    expect(mockGet).toHaveBeenCalledWith('/stillagelocation/list/1');
  });

  it('throws on failure', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false, error: 'not found' } });
    await expect(listStillageLocations(99)).rejects.toThrow('not found');
  });
});

// ── Product Categories ────────────────────────────────────────────────────────

const CATEGORY: ProductCategory = { product_category_id: 2, description: 'Beer' };

describe('listProductCategories', () => {
  it('returns categories on success', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: true, objects: [CATEGORY] } });
    const result = await listProductCategories();
    expect(result).toEqual([CATEGORY]);
  });

  it('throws on failure', async () => {
    mockGet.mockResolvedValueOnce({ data: { success: false } });
    await expect(listProductCategories()).rejects.toThrow('Failed to list product categories');
  });
});

import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Festival } from '@/types/api';

process.env.EXPO_PUBLIC_CURRENT_FESTIVAL = 'CBF 2026';

jest.mock('@/api/festivals', () => ({
  listFestivals: jest.fn(),
}));

const { useCurrentFestivalId } = require('@/hooks/useFestivals');
const { listFestivals } = require('@/api/festivals');
const mockListFestivals = listFestivals as jest.Mock;

const FESTIVALS: Festival[] = [
  { festival_id: 1, year: 2025, name: 'CBF 2025', description: null, fst_start_date: '2025-05-01', fst_end_date: '2025-05-03' },
  { festival_id: 2, year: 2026, name: 'CBF 2026', description: null, fst_start_date: '2026-05-01', fst_end_date: '2026-05-03' },
];

let queryClient: QueryClient;
let cleanupPending: (() => void) | null = null;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  cleanupPending = null;
});

afterEach(async () => {
  if (cleanupPending) {
    cleanupPending();
    cleanupPending = null;
  }
  queryClient.clear();
});

function makeWrapper() {
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
}

describe('useCurrentFestivalId', () => {
  it('returns the festival_id matching EXPO_PUBLIC_CURRENT_FESTIVAL', async () => {
    mockListFestivals.mockResolvedValue(FESTIVALS);
    const { result } = renderHook(() => useCurrentFestivalId(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current).toBe(2));
  });

  it('returns undefined while festivals are loading', () => {
    mockListFestivals.mockReturnValue(
      new Promise<Festival[]>((resolve) => {
        cleanupPending = () => resolve([]);
      }),
    );
    const { result } = renderHook(() => useCurrentFestivalId(), { wrapper: makeWrapper() });
    expect(result.current).toBeUndefined();
  });

  it('returns undefined when no festival matches the env var', async () => {
    mockListFestivals.mockResolvedValue([FESTIVALS[0]]); // only CBF 2025
    const { result } = renderHook(() => useCurrentFestivalId(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current).toBeUndefined());
  });
});

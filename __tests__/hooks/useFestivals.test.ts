/**
 * Tests for useCurrentFestivalId hook.
 */
import React from 'react';
import { renderHook } from '@testing-library/react-native';
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

function makeWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client }, children);
}

describe('useCurrentFestivalId', () => {
  it('returns the festival_id matching EXPO_PUBLIC_CURRENT_FESTIVAL', async () => {
    mockListFestivals.mockResolvedValue(FESTIVALS);
    const { result, rerender } = renderHook(() => useCurrentFestivalId(), { wrapper: makeWrapper() });
    // Wait for query to resolve
    await new Promise((r) => setTimeout(r, 50));
    rerender({});
    expect(result.current).toBe(2);
  });

  it('returns undefined while festivals are loading', async () => {
    mockListFestivals.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useCurrentFestivalId(), { wrapper: makeWrapper() });
    // No need to wait — before the query resolves the value is undefined
    expect(result.current).toBeUndefined();
  });

  it('returns undefined when no festival matches the env var', async () => {
    mockListFestivals.mockResolvedValue([FESTIVALS[0]]); // only CBF 2025
    const { result, rerender } = renderHook(() => useCurrentFestivalId(), { wrapper: makeWrapper() });
    await new Promise((r) => setTimeout(r, 50));
    rerender({});
    expect(result.current).toBeUndefined();
  });
});

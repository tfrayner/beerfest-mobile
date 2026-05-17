import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Festival } from '@/types/api';

jest.mock('@/api/festivals', () => ({
  listFestivals: jest.fn(),
  currentFestival: jest.fn(),
}));

const { useCurrentFestival, useCurrentFestivalId } = require('@/hooks/useFestivals');
const { currentFestival } = require('@/api/festivals');
const mockCurrentFestival = currentFestival as jest.Mock;

const CURRENT: Festival = {
  festival_id: 2,
  year: 2026,
  name: 'CBF 2026',
  description: '',
  fst_start_date: '2026-05-01',
  fst_end_date: '2026-05-03',
};

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

describe('useCurrentFestival', () => {
  it('returns the current festival from the API', async () => {
    mockCurrentFestival.mockResolvedValue(CURRENT);
    const { result } = renderHook(() => useCurrentFestival(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.data).toEqual(CURRENT));
  });

  it('is in loading state before the API resolves', () => {
    mockCurrentFestival.mockReturnValue(
      new Promise<Festival>((resolve) => {
        cleanupPending = () => resolve(CURRENT);
      }),
    );
    const { result } = renderHook(() => useCurrentFestival(), { wrapper: makeWrapper() });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
  });

  it('exposes an error when the API rejects', async () => {
    mockCurrentFestival.mockRejectedValue(new Error('Failed to load current festival'));
    const { result } = renderHook(() => useCurrentFestival(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe('useCurrentFestivalId', () => {
  it('returns the festival_id of the current festival', async () => {
    mockCurrentFestival.mockResolvedValue(CURRENT);
    const { result } = renderHook(() => useCurrentFestivalId(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current).toBe(2));
  });

  it('returns undefined while the current festival is loading', () => {
    mockCurrentFestival.mockReturnValue(
      new Promise<Festival>((resolve) => {
        cleanupPending = () => resolve(CURRENT);
      }),
    );
    const { result } = renderHook(() => useCurrentFestivalId(), { wrapper: makeWrapper() });
    expect(result.current).toBeUndefined();
  });

  it('returns undefined when the API rejects', async () => {
    mockCurrentFestival.mockRejectedValue(new Error('Failed to load current festival'));
    const { result } = renderHook(() => useCurrentFestivalId(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current).toBeUndefined());
  });
});

import { act } from 'react';
import * as SecureStore from 'expo-secure-store';
import { setSessionCookie, clearSessionCookie } from '@/api/client';

// Auto-mock expo-secure-store via __mocks__/expo-secure-store.ts
// Mock client helpers to track calls
jest.mock('@/api/client', () => ({
  setSessionCookie: jest.fn(),
  clearSessionCookie: jest.fn(),
}));

// Import store AFTER mocks are in place
const { useAuthStore } = require('@/store/authStore');
const { __reset } = require('expo-secure-store') as typeof import('../../__mocks__/expo-secure-store');

const mockSetCookie = setSessionCookie as jest.Mock;
const mockClearCookie = clearSessionCookie as jest.Mock;

beforeEach(async () => {
  __reset();
  mockSetCookie.mockClear();
  mockClearCookie.mockClear();
  // Reset Zustand store to initial state
  useAuthStore.setState({ sessionCookie: null, isAuthenticated: false });
});

describe('authStore.login', () => {
  it('stores the cookie in SecureStore and marks authenticated', async () => {
    await act(async () => {
      await useAuthStore.getState().login('session=xyz');
    });

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('session_cookie', 'session=xyz');
    expect(mockSetCookie).toHaveBeenCalledWith('session=xyz');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().sessionCookie).toBe('session=xyz');
  });
});

describe('authStore.logout', () => {
  it('removes the cookie from SecureStore and marks unauthenticated', async () => {
    useAuthStore.setState({ sessionCookie: 'session=xyz', isAuthenticated: true });

    await act(async () => {
      await useAuthStore.getState().logout();
    });

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('session_cookie');
    expect(mockClearCookie).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().sessionCookie).toBeNull();
  });
});

describe('authStore.restoreSession', () => {
  it('restores an existing session from SecureStore', async () => {
    (SecureStore.setItemAsync as jest.Mock)('session_cookie', 'session=restored');

    await act(async () => {
      await useAuthStore.getState().restoreSession();
    });

    expect(mockSetCookie).toHaveBeenCalledWith('session=restored');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it('leaves the store unauthenticated when nothing is stored', async () => {
    await act(async () => {
      await useAuthStore.getState().restoreSession();
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

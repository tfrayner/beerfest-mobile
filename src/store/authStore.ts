import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { clearSessionCookie, setSessionCookie } from '@/api/client';

const COOKIE_KEY = 'session_cookie';

interface AuthState {
  sessionCookie: string | null;
  isAuthenticated: boolean;
  login: (cookie: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  sessionCookie: null,
  isAuthenticated: false,

  login: async (cookie: string) => {
    await SecureStore.setItemAsync(COOKIE_KEY, cookie);
    setSessionCookie(cookie);
    set({ sessionCookie: cookie, isAuthenticated: true });
  },

  logout: async () => {
    await SecureStore.deleteItemAsync(COOKIE_KEY);
    clearSessionCookie();
    set({ sessionCookie: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    const cookie = await SecureStore.getItemAsync(COOKIE_KEY);
    if (cookie) {
      setSessionCookie(cookie);
      set({ sessionCookie: cookie, isAuthenticated: true });
    }
  },
}));

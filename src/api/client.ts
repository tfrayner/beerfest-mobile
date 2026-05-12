import axios from 'axios';
import type { InternalAxiosRequestConfig } from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
});

/** Call this after login to inject the session cookie into all requests. */
export function setSessionCookie(cookie: string) {
  apiClient.defaults.headers.common['Cookie'] = cookie;
}

/** Remove the session cookie header (on logout). */
export function clearSessionCookie() {
  delete apiClient.defaults.headers.common['Cookie'];
}

/** Intercept 403 responses — callers can subscribe to fire a logout callback. */
type UnauthorizedCallback = () => void;
let _onUnauthorized: UnauthorizedCallback | null = null;

export function setUnauthorizedCallback(cb: UnauthorizedCallback) {
  _onUnauthorized = cb;
}

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 403) {
      console.warn(
        '[apiClient] 403 received:',
        error.config?.method?.toUpperCase(),
        error.config?.url,
        error.response?.data,
      );
      // Only treat as an auth failure if the response doesn't indicate a
      // business-logic error (beerfestdb reuses 403 for validation failures
      // but sets success:true in those cases).
      if (error.response?.data?.success !== true) {
        _onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  },
);

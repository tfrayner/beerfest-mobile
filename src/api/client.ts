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
  clearCsrfToken();
}

// ---------------------------------------------------------------------------
// CSRF token management
// beerfestdb sends the current token in X-CSRF-Token on every response.
// We echo it back as a csrf_token body parameter on submit, delete and login
// actions, matching the behaviour of Ext.Ajax.extraParams.
// ---------------------------------------------------------------------------

let _csrfToken: string | null = null;

export function setCsrfToken(token: string) {
  _csrfToken = token;
}

export function clearCsrfToken() {
  _csrfToken = null;
}

function storeCsrfTokenFromHeaders(headers: Record<string, unknown>): void {
  const token = headers['x-csrf-token'];
  if (typeof token === 'string' && token) {
    _csrfToken = token;
  }
}

/** Returns true for action URLs that require a CSRF token in the body. */
function requiresCsrfToken(url: string | undefined): boolean {
  if (!url) return false;
  return /\/(submit|delete|login)(\?|$)/.test(url);
}

// Append csrf_token to the form-encoded body for submit/delete/login actions.
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_csrfToken && requiresCsrfToken(config.url)) {
    const tokenParam = `csrf_token=${encodeURIComponent(_csrfToken)}`;
    config.data = config.data ? `${config.data}&${tokenParam}` : tokenParam;
  }
  return config;
});

/** Intercept 401 responses — callers can subscribe to fire a logout callback. */
type UnauthorizedCallback = () => void;
let _onUnauthorized: UnauthorizedCallback | null = null;

export function setUnauthorizedCallback(cb: UnauthorizedCallback) {
  _onUnauthorized = cb;
}

apiClient.interceptors.response.use(
  (response) => {
    storeCsrfTokenFromHeaders(response.headers as Record<string, unknown>);
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      storeCsrfTokenFromHeaders(error.response.headers as Record<string, unknown>);
      if (error.response.status === 401) {
        console.warn(
          '[apiClient] 401 received:',
          error.config?.method?.toUpperCase(),
          error.config?.url,
        );
        _onUnauthorized?.();
      }
    }
    return Promise.reject(error);
  },
);

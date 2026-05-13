import axios from 'axios';
import {
  apiClient,
  setSessionCookie,
  clearSessionCookie,
  setUnauthorizedCallback,
} from '@/api/client';

describe('apiClient', () => {
  describe('setSessionCookie / clearSessionCookie', () => {
    afterEach(() => {
      clearSessionCookie();
    });

    it('sets the Cookie header on the shared instance', () => {
      setSessionCookie('session=abc123');
      expect(apiClient.defaults.headers.common['Cookie']).toBe('session=abc123');
    });

    it('clears the Cookie header', () => {
      setSessionCookie('session=abc123');
      clearSessionCookie();
      expect(apiClient.defaults.headers.common['Cookie']).toBeUndefined();
    });
  });

  describe('setUnauthorizedCallback', () => {
    it('invokes the registered callback when a 403 response is received', async () => {
      const cb = jest.fn();
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      setUnauthorizedCallback(cb);

      // Simulate a rejected axios error with status 403
      const err = Object.assign(new Error('Forbidden'), {
        isAxiosError: true,
        response: { status: 403 },
      });

      // Reach into the response interceptors and call the rejection handler
      const interceptors = (apiClient.interceptors.response as any).handlers;
      const lastHandler = interceptors[interceptors.length - 1];
      await expect(lastHandler.rejected(err)).rejects.toThrow('Forbidden');

      expect(cb).toHaveBeenCalledTimes(1);

      // Cleanup
      warnSpy.mockRestore();
      setUnauthorizedCallback(() => {});
    });

    it('does not invoke the callback for non-403 errors', async () => {
      const cb = jest.fn();
      setUnauthorizedCallback(cb);

      const err = Object.assign(new Error('Not Found'), {
        isAxiosError: true,
        response: { status: 404 },
      });

      const interceptors = (apiClient.interceptors.response as any).handlers;
      const lastHandler = interceptors[interceptors.length - 1];
      await expect(lastHandler.rejected(err)).rejects.toThrow('Not Found');

      expect(cb).not.toHaveBeenCalled();

      setUnauthorizedCallback(() => {});
    });
  });
});

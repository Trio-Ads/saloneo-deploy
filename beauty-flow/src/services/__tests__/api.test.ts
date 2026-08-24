import { describe, it, expect, beforeEach } from 'vitest';
import api from '../api';

// Fake location so `window.location.href = ...` is observable in jsdom
const fakeLocation = { href: 'http://localhost/auth/login', pathname: '/auth/login' };
Object.defineProperty(window, 'location', { value: fakeLocation, writable: true });

const reject401 = () =>
  Promise.reject({ response: { status: 401 }, config: {}, isAxiosError: true } as any);

describe('api 401 interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    fakeLocation.href = 'http://localhost/auth/login';
  });

  it('does not redirect when no token was ever sent (unauthenticated visitor)', async () => {
    api.defaults.adapter = (config) =>
      Promise.reject({ response: { status: 401 }, config, isAxiosError: true } as any);
    await expect(api.get('/profile')).rejects.toBeTruthy();
    expect(fakeLocation.href).toBe('http://localhost/auth/login');
  });

  it('redirects to login when a token exists but is rejected and no refresh token', async () => {
    localStorage.setItem('token', 'stale');
    api.defaults.adapter = (config) =>
      Promise.reject({ response: { status: 401 }, config, isAxiosError: true } as any);
    await expect(api.get('/profile')).rejects.toBeTruthy();
    expect(fakeLocation.href).toBe('/auth/login');
    expect(localStorage.getItem('token')).toBeNull();
  });
});

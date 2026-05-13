import { apiClient } from '@/lib/api/client';
import type {
  AuthCredentials,
  AuthResponse,
  AuthUser,
  RefreshResponse,
} from '@/lib/auth/types';

export async function login(credentials: AuthCredentials) {
  const response = await apiClient.post<AuthResponse>(
    '/auth/login',
    credentials,
    { skipAuthRefresh: true },
  );

  return response.data;
}

export async function register(credentials: AuthCredentials) {
  const response = await apiClient.post<AuthResponse>(
    '/auth/register',
    credentials,
    { skipAuthRefresh: true },
  );

  return response.data;
}

export async function refresh() {
  const response = await apiClient.post<RefreshResponse>(
    '/auth/refresh',
    undefined,
    { skipAuthRefresh: true },
  );

  return response.data;
}

export async function logout() {
  await apiClient.post('/auth/logout', undefined, { skipAuthRefresh: true });
}

export async function getCurrentUser() {
  const response = await apiClient.get<{ user: AuthUser }>('/auth/me');

  return response.data.user;
}

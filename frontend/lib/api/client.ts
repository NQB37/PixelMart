import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { getAccessToken, setAccessToken } from '@/lib/auth/token';
import type { ApiErrorBody, RefreshResponse } from '@/lib/auth/types';

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    skipAuthRefresh?: boolean;
  }
}

const baseURL =
  process.env.NEXT_PUBLIC_USER_SERVICE_URL ?? 'http://localhost:8000/api/v1';

export class ApiClientError extends Error {
  status?: number;
  details?: unknown;

  constructor(message: string, status?: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
});

let refreshRequest: Promise<string> | null = null;

function normalizeError(error: AxiosError<ApiErrorBody>) {
  const message =
    error.response?.data?.message ?? error.message ?? 'Request failed';

  return new ApiClientError(
    message,
    error.response?.status,
    error.response?.data?.details,
  );
}

function notifySessionExpired() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth:session-expired'));
  }
}

async function refreshAccessToken() {
  refreshRequest ??= apiClient
    .post<RefreshResponse>(
      '/auth/refresh',
      undefined,
      { skipAuthRefresh: true },
    )
    .then((response) => {
      setAccessToken(response.data.accessToken);
      return response.data.accessToken;
    })
    .finally(() => {
      refreshRequest = null;
    });

  return refreshRequest;
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as AxiosRequestConfig | undefined;
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.skipAuthRefresh
    ) {
      originalRequest._retry = true;

      try {
        await refreshAccessToken();
        return apiClient(originalRequest);
      } catch {
        setAccessToken(null);
        notifySessionExpired();
      }
    }

    return Promise.reject(normalizeError(error));
  },
);

import axios, { type AxiosInstance } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig {
    /** Skip the global error toast for this request (e.g. an expected 404). */
    skipErrorToast?: boolean;
  }
}

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
};

export function createAuthApiClient(config: {
  baseURL: string;
  timeout?: number;
  getAccessToken: () => string | null;
  setAccessToken: (token: string) => void;
  refreshToken: () => Promise<{ accessToken: string }>;
  onRefreshFailure: () => void;
  notifyError: (message: string) => void;
}): AxiosInstance {
  const api = axios.create({
    baseURL: config.baseURL,
    timeout: config.timeout,
    withCredentials: true,
  });

  api.interceptors.request.use((reqConfig) => {
    const token = config.getAccessToken();
    if (token) {
      reqConfig.headers["Authorization"] = `Bearer ${token}`;
    }
    return reqConfig;
  });

  let isRefreshing = false;
  let failedQueue: FailedRequest[] = [];

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token!);
      }
    });
    failedQueue = [];
  };

  api.interceptors.response.use(
    (response) => response.data,
    async (error) => {
      const originalRequest = error.config;
      const status = error.response ? error.response.status : null;

      if (
        status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !originalRequest.url?.includes("auth/refresh") &&
        !originalRequest.url?.includes("auth/login")
      ) {
        if (isRefreshing) {
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const data = await config.refreshToken();
          const newAccessToken = data.accessToken;

          config.setAccessToken(newAccessToken);
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          processQueue(null, newAccessToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          config.onRefreshFailure();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      if (error.response?.status !== 401 && !originalRequest?.skipErrorToast) {
        config.notifyError(error.response?.data?.message || error?.message);
      }

      return Promise.reject(error);
    },
  );

  return api;
}

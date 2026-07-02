import axios from "axios";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { toast } from "react-toastify";
import { authApi } from "@/features/auth/services/auth.service";

export const api = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:8000/api/v1",
  timeout: 10000,
  withCredentials: true,
});

// Request interceptor
api.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    const token = useAuthStore.getState().accessToken;
    if (token) {
      // Attach token to Authorization header
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string) => void;
  reject: (err: any) => void;
}[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

// Response interceptor
api.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response.data;
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const originalRequest = error.config;
    const status = error.response ? error.response.status : null;

    // Refresh token if catch 401 error and not retry
    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("auth/refresh") &&
      !originalRequest.url?.includes("auth/login")
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const data = await authApi.refreshToken();
        const newAccessToken = data.accessToken;

        // Save new access token
        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError, null);
        toast.error("Refresh token failed. Please login again!");
        useAuthStore.getState().clearAuth();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status !== 401) {
      toast.error(error.response?.data?.message || error?.message);
    }

    return Promise.reject(error);
  },
);

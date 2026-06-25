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

// Response interceptor
api.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  async function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
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
      originalRequest._retry = true;

      try {
        const data = await authApi.refreshToken();
        const newAccessToken = data.accessToken;

        // Save new access token
        useAuthStore.getState().setAccessToken(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        toast.error("Refresh token failed. Please login again!");
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    if (error.response?.status !== 401) {
      toast.error(error.response?.data?.message || error?.message);
    }

    return Promise.reject(error);
  },
);

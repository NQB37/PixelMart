import { createAuthApiClient } from "@pixelmart/shared/auth";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { toast } from "react-toastify";
import { authApi } from "@/features/auth/services/auth.service";

export const api = createAuthApiClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  getAccessToken: () => useAuthStore.getState().accessToken,
  setAccessToken: (token) => useAuthStore.getState().setAccessToken(token),
  refreshToken: () => authApi.refreshToken(),
  onRefreshFailure: () => {
    toast.error("Session expired. Please login again!");
    useAuthStore.getState().clearAuth();
    window.location.href = "/login";
  },
  notifyError: (message) => toast.error(message),
});

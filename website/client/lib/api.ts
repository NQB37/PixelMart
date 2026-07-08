import { createAuthApiClient } from "@website/shared/auth";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { toast } from "react-toastify";
import { authApi } from "@/features/auth/services/auth.service";

export const api = createAuthApiClient({
  baseURL:
    process.env.NEXT_PUBLIC_BASE_API_URL || "http://localhost:8000/api/v1",
  timeout: 10000,
  getAccessToken: () => useAuthStore.getState().accessToken,
  setAccessToken: (token) => useAuthStore.getState().setAccessToken(token),
  refreshToken: () => authApi.refreshToken(),
  onRefreshFailure: () => {
    toast.error("Refresh token failed. Please login again!");
    useAuthStore.getState().clearAuth();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  },
  notifyError: (message) => toast.error(message),
});

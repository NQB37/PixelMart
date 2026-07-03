import axios from "axios";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use((response) => response.data);

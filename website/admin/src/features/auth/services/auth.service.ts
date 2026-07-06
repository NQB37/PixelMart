import { api } from "@/lib/api";
import type { LoginInput } from "../schemas/auth.schema";
import type { AuthResponse, RefreshTokenResponse } from "../types/auth";

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("auth/login", data);
    return response.data;
  },
  logout: async () => {
    await api.post("auth/logout");
  },
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>("auth/refresh");
    return response.data;
  },
};

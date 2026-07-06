import { api } from "@/lib/api";
import type { LoginInput, RegisterInput } from "../schemas/auth.schema";
import type { AuthResponse, RefreshTokenResponse, UserInfo } from "../types/auth";

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("auth/login", data);
    return response.data;
  },
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const { email, password } = data;
    const response = await api.post<AuthResponse>("auth/register", {
      email,
      password,
    });
    return response.data;
  },
  logout: async () => {
    await api.post("auth/logout");
  },
  refreshToken: async (): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>("auth/refresh");
    return response.data;
  },
  getMe: async (): Promise<UserInfo> => {
    const response = await api.get<UserInfo>("auth/me");
    return response.data;
  },
};

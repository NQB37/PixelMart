import { LoginInput, SignupInput } from "../schemas/auth.schema";
import { AuthResponse, RefreshTokenResponse } from "../types/auth";
import { api } from "@/lib/api";

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("auth/login", data);
    return response.data;
  },
  register: async (data: SignupInput): Promise<AuthResponse> => {
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
};

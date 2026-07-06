import type { AxiosInstance } from "axios";
import type { AuthResponse, RefreshTokenResponse, UserInfo } from "./types";

export function createAuthApi(client: AxiosInstance) {
  return {
    login: async (data: {
      email: string;
      password: string;
    }): Promise<AuthResponse> => {
      const response = await client.post<AuthResponse>("auth/login", data);
      return response.data;
    },
    register: async (data: {
      email: string;
      password: string;
    }): Promise<AuthResponse> => {
      const response = await client.post<AuthResponse>("auth/register", data);
      return response.data;
    },
    logout: async (): Promise<void> => {
      await client.post("auth/logout");
    },
    refreshToken: async (): Promise<RefreshTokenResponse> => {
      const response =
        await client.post<RefreshTokenResponse>("auth/refresh");
      return response.data;
    },
    getMe: async (): Promise<UserInfo> => {
      const response = await client.get<UserInfo>("auth/me");
      return response.data;
    },
  };
}

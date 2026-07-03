import { api } from "@/lib/api";
import type { LoginInput } from "../schemas/auth.schema";
import type { AuthResponse } from "../types/auth";

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("auth/login", data);
    return response.data;
  },
};

import { LoginInput, SignupInput } from "../schemas/auth.schema";
import axios from "axios";
import { AuthResponse } from "../types/auth";

export const authApi = {
  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await axios.post<AuthResponse>(
      "http://localhost:8000/api/v1/auth/login",
      data,
    );
    return response.data;
  },
  register: async (data: SignupInput): Promise<AuthResponse> => {
    const { email, password } = data;
    const response = await axios.post<AuthResponse>(
      "http://localhost:8000/api/v1/auth/register",
      {
        email,
        password,
      },
    );
    return response.data;
  },
  logout: async () => {
    const response = await axios.post("http://localhost:8000/api/v1/auth/logout");
    return response.data;
  },
};

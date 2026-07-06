import { createAuthApi } from "@pixelmart/shared/auth";
import { api } from "@/lib/api";
import type { RegisterInput } from "../schemas/auth.schema";

const baseAuthApi = createAuthApi(api);

export const authApi = {
  ...baseAuthApi,
  register: (data: RegisterInput) => {
    const { email, password } = data;
    return baseAuthApi.register({ email, password });
  },
};

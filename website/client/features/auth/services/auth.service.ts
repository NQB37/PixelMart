import { createAuthApi } from "@pixelmart/shared/auth";
import { api } from "@/lib/api";
import type { SignupInput } from "../schemas/auth.schema";

const baseAuthApi = createAuthApi(api);

export const authApi = {
  ...baseAuthApi,
  register: (data: SignupInput) => {
    const { email, password } = data;
    return baseAuthApi.register({ email, password });
  },
};

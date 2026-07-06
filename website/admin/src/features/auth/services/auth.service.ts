import { createAuthApi } from "@pixelmart/shared/auth";
import { api } from "@/lib/api";

export const authApi = createAuthApi(api);

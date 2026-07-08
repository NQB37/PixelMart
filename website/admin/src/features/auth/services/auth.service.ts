import { createAuthApi } from "@website/shared/auth";
import { api } from "@/lib/api";

export const authApi = createAuthApi(api);

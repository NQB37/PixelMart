import { createAuthStore } from "@website/shared/auth";

export const useAuthStore = createAuthStore("vendor-user-info", {
  persistIsAuthenticated: true,
});

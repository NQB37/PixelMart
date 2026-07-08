import { createAuthStore } from "@website/shared/auth";

export const useAuthStore = createAuthStore("admin-user-info", {
  persistIsAuthenticated: true,
});

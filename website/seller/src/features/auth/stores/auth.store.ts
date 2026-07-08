import { createAuthStore } from "@website/shared/auth";

export const useAuthStore = createAuthStore("seller-user-info", {
  persistIsAuthenticated: true,
});

import { createAuthStore } from "@pixelmart/shared/auth";

export const useAuthStore = createAuthStore("seller-user-info", {
  persistIsAuthenticated: true,
});

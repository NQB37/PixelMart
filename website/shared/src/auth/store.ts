import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UserInfo } from "./types";

export type AuthState = {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: UserInfo, accessToken: string) => void;
  clearAuth: () => void;
  /** `user` comes from a refresh round trip; omit it to only swap the token. */
  setAccessToken: (accessToken: string, user?: UserInfo) => void;
  setHasHydrated: (value: boolean) => void;
};

/**
 * `persistIsAuthenticated` matches each app's pre-existing persist shape:
 * client only persisted `user` (relies on a refresh-token round trip to
 * re-derive auth), admin/vendor also persisted `isAuthenticated`.
 */
export function createAuthStore(
  storageKey: string,
  options?: { persistIsAuthenticated?: boolean },
) {
  return create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        hasHydrated: false,

        setAuth: (user, accessToken) =>
          set({ user, accessToken, isAuthenticated: true }),
        clearAuth: () =>
          set({ user: null, accessToken: null, isAuthenticated: false }),
        setAccessToken: (accessToken, user) =>
          set(
            user ? { accessToken, user, isAuthenticated: true } : { accessToken },
          ),
        setHasHydrated: (value) => set({ hasHydrated: value }),
      }),
      {
        name: storageKey,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) =>
          options?.persistIsAuthenticated
            ? { user: state.user, isAuthenticated: state.isAuthenticated }
            : { user: state.user },
        onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
      },
    ),
  );
}

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserInfo } from "../types/auth";

type AuthState = {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  setAuth: (user: UserInfo, accessToken: string) => void;
  clearAuth: () => void;
  setAccessToken: (accessToken: string) => void;
  setHasHydrated: (value: boolean) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,
      // false until persisted state is read from localStorage; guards wait on this
      hasHydrated: false,

      // action
      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
      setAccessToken: (newToken: string) =>
        set({
          accessToken: newToken,
        }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: "user-info",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => state?.setHasHydrated(true),
    },
  ),
);

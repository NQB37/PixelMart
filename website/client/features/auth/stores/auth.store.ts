import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { UserInfo } from "../types/auth";

export type UserRole = "ADMIN" | "CUSTOMER" | "STAFF";

type AuthState = {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserInfo, accessToken: string) => void;
  clearAuth: () => void;
  setAccessToken: (accessToken: string) => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // initial state
      user: null,
      accessToken: null,
      isAuthenticated: false,

      // action
      setAuth: (user, accessToken) =>
        set({
          user,
          accessToken,
        }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
        }),
      setAccessToken: (newToken: string) =>
        set({
          accessToken: newToken,
        }),
    }),
    {
      name: "user-info",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
    },
  ),
);

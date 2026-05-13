'use client';

import { create } from 'zustand';
import {
  clearAccessToken,
  setAccessToken,
  subscribeAccessToken,
} from '@/lib/auth/token';
import * as authService from '@/lib/auth/service';
import type { AuthCredentials, AuthUser } from '@/lib/auth/types';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (credentials: AuthCredentials) => Promise<void>;
  signup: (credentials: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Request failed';
}

function applySession(user: AuthUser, accessToken: string) {
  setAccessToken(accessToken);

  return {
    user,
    accessToken,
    status: 'authenticated' as const,
    error: null,
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  status: 'idle',
  error: null,

  bootstrap: async () => {
    if (get().status === 'authenticated' || get().status === 'loading') {
      return;
    }

    set({ status: 'loading', error: null });

    try {
      const refreshed = await authService.refresh();
      setAccessToken(refreshed.accessToken);

      const user = await authService.getCurrentUser();

      set({
        user,
        accessToken: refreshed.accessToken,
        status: 'authenticated',
        error: null,
      });
    } catch {
      clearAccessToken();
      set({
        user: null,
        accessToken: null,
        status: 'unauthenticated',
        error: null,
      });
    }
  },

  login: async (credentials) => {
    set({ status: 'loading', error: null });

    try {
      const result = await authService.login(credentials);
      set(applySession(result.user, result.accessToken));
    } catch (error) {
      clearAccessToken();
      set({
        user: null,
        accessToken: null,
        status: 'unauthenticated',
        error: getErrorMessage(error),
      });
      throw error;
    }
  },

  signup: async (credentials) => {
    set({ status: 'loading', error: null });

    try {
      const result = await authService.register(credentials);
      set(applySession(result.user, result.accessToken));
    } catch (error) {
      clearAccessToken();
      set({
        user: null,
        accessToken: null,
        status: 'unauthenticated',
        error: getErrorMessage(error),
      });
      throw error;
    }
  },

  logout: async () => {
    set({ status: 'loading', error: null });

    try {
      await authService.logout();
    } finally {
      clearAccessToken();
      set({
        user: null,
        accessToken: null,
        status: 'unauthenticated',
        error: null,
      });
    }
  },

  clearSession: () => {
    clearAccessToken();
    set({
      user: null,
      accessToken: null,
      status: 'unauthenticated',
      error: null,
    });
  },
}));

subscribeAccessToken((accessToken) => {
  useAuthStore.setState({ accessToken });
});

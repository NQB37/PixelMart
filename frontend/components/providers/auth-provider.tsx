'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth-store';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const bootstrap = useAuthStore((state) => state.bootstrap);
  const clearSession = useAuthStore((state) => state.clearSession);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  useEffect(() => {
    window.addEventListener('auth:session-expired', clearSession);

    return () => {
      window.removeEventListener('auth:session-expired', clearSession);
    };
  }, [clearSession]);

  return children;
}

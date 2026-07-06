"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../stores/auth.store";
import { UserRole } from "../types/auth";

type RoleGuardProps = {
  // omit to require authentication only (any logged-in user)
  allowedRoles?: UserRole[];
  children: React.ReactNode;
};

const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const hasRole =
    !allowedRoles || !!user?.roles.some((role) => allowedRoles.includes(role));

  useEffect(() => {
    if (!hasHydrated) return;
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!hasRole) {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, hasRole, router]);

  if (!hasHydrated || !isAuthenticated || !hasRole) return null;

  return <>{children}</>;
};

export default RoleGuard;

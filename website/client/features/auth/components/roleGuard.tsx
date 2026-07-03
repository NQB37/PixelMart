"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "../stores/auth.store";
import { UserRole } from "../types/auth";

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: React.ReactNode;
};

const RoleGuard = ({ allowedRoles, children }: RoleGuardProps) => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const hasRole = !!user?.roles.some((role) => allowedRoles.includes(role));

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    } else if (!hasRole) {
      router.replace("/");
    }
  }, [isAuthenticated, hasRole, router]);

  if (!isAuthenticated || !hasRole) return null;

  return <>{children}</>;
};

export default RoleGuard;

import type { UserInfo, UserRole } from "./types";

export function hasRole(user: UserInfo | null, roles: UserRole[]): boolean {
  return !!user && user.roles.some((role) => roles.includes(role));
}

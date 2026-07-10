import type { UserRole } from "@website/shared/auth";

export interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  roles: UserRole[];
  isActive: boolean;
  deletedAt: string | null;
  createdAt: string;
}

export interface ListUsersParams {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface ListUsersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ListUsersResponse {
  users: AdminUser[];
  meta: ListUsersMeta;
}

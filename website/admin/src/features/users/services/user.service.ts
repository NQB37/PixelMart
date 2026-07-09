import { api } from "@/lib/api";
import type { AdminUser, ListUsersParams, ListUsersResponse } from "../types/user";

export const userApi = {
  list: async (params: ListUsersParams): Promise<ListUsersResponse> => {
    const response = await api.get<ListUsersResponse>("users", { params });
    return response.data;
  },
  updateStatus: async (id: string, isActive: boolean): Promise<AdminUser> => {
    const response = await api.patch<AdminUser>(`users/${id}/status`, { isActive });
    return response.data;
  },
};

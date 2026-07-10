import { api } from "@/lib/api";
import type { AdminShopDetail, ListShopsParams, ListShopsResponse } from "../types/shop";

export const shopApi = {
  list: async (params: ListShopsParams): Promise<ListShopsResponse> => {
    const response = await api.get<ListShopsResponse>("shops", { params });
    return response.data;
  },
  getDetail: async (id: string): Promise<AdminShopDetail> => {
    const response = await api.get<AdminShopDetail>(`shops/${id}`);
    return response.data;
  },
  approve: async (id: string): Promise<AdminShopDetail> => {
    const response = await api.patch<AdminShopDetail>(`shops/${id}/approve`);
    return response.data;
  },
  reject: async (id: string, rejectedReason: string): Promise<AdminShopDetail> => {
    const response = await api.patch<AdminShopDetail>(`shops/${id}/reject`, { rejectedReason });
    return response.data;
  },
};

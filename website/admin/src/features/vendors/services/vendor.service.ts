import { api } from "@/lib/api";
import type { AdminVendorDetail, ListVendorsParams, ListVendorsResponse } from "../types/vendor";

export const vendorApi = {
  list: async (params: ListVendorsParams): Promise<ListVendorsResponse> => {
    const response = await api.get<ListVendorsResponse>("vendors", { params });
    return response.data;
  },
  getDetail: async (id: string): Promise<AdminVendorDetail> => {
    const response = await api.get<AdminVendorDetail>(`vendors/${id}`);
    return response.data;
  },
  approve: async (id: string): Promise<AdminVendorDetail> => {
    const response = await api.patch<AdminVendorDetail>(`vendors/${id}/approve`);
    return response.data;
  },
  reject: async (id: string, rejectedReason: string): Promise<AdminVendorDetail> => {
    const response = await api.patch<AdminVendorDetail>(`vendors/${id}/reject`, { rejectedReason });
    return response.data;
  },
};

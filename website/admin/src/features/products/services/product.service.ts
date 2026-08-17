import { api } from "@/lib/api";
import type {
  AdminProductDetail,
  ListProductsParams,
  ListProductsResponse,
} from "../types/product";

export const productApi = {
  list: async (params: ListProductsParams): Promise<ListProductsResponse> => {
    const response = await api.get<ListProductsResponse>("products/admin", {
      params,
    });
    return response.data;
  },
  getDetail: async (id: string): Promise<AdminProductDetail> => {
    const response = await api.get<AdminProductDetail>(`products/${id}`);
    return response.data;
  },
  approve: async (id: string): Promise<AdminProductDetail> => {
    const response = await api.patch<AdminProductDetail>(
      `products/${id}/approve`,
    );
    return response.data;
  },
  reject: async (
    id: string,
    rejectedReason: string,
  ): Promise<AdminProductDetail> => {
    const response = await api.patch<AdminProductDetail>(
      `products/${id}/reject`,
      {
        rejectedReason,
      },
    );
    return response.data;
  },
};

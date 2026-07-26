import { api } from "@/lib/api";
import type { Brand } from "../types/brand";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "../schemas/brand.schema";

export const brandApi = {
  // PUBLIC
  getAllBrands: async () => {
    const response = await api.get<Brand[]>("brands");
    return response.data;
  },
  // ADMIN
  createBrand: async (data: CreateBrandInput) => {
    const response = await api.post<Brand>("brands", data);
    return response.data;
  },
  updateBrand: async (id: string, data: UpdateBrandInput) => {
    const response = await api.patch<Brand>(`brands/${id}`, data);
    return response.data;
  },
  deleteBrand: async (id: string) => {
    const response = await api.delete<Brand>(`brands/${id}`);
    return response.data;
  },
};

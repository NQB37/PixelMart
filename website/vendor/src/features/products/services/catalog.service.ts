import { api } from "@/lib/api";

// Read-only lookups used to fill the product form's brand/category selects.
export interface CatalogOption {
  id: string;
  name: string;
}

export const catalogApi = {
  getAllBrands: async () => {
    const response = await api.get<CatalogOption[]>("brands");
    return response.data;
  },
  getAllCategories: async () => {
    const response = await api.get<CatalogOption[]>("categories");
    return response.data;
  },
};

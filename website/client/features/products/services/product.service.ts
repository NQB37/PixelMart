import { api } from "@/lib/api";
import type { ProductVariant } from "../types/product.type";

// Product in Client = ProductVariant
export const productApi = {
  getAllProducts: async () => {
    const response = await api.get<ProductVariant[]>("products/variants");
    return response.data;
  },
  getProductBySlug: async (slug: string) => {
    const response = await api.get<ProductVariant>(`products/variants/${slug}`);
    return response.data;
  },
};

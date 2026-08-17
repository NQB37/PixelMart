import { api } from "@/lib/api";
import type { Product, ProductDetail, ProductVariant } from "../types/product";
import type {
  CreateProductInput,
  UpdateProductInput,
} from "../schemas/product.schema";

export const productApi = {
  // Public
  getAllProducts: async () => {
    const response = await api.get<Product[]>("products");
    return response.data;
  },
  getProductBySlug: async (slug: string) => {
    const response = await api.get<Product>(`products/${slug}`);
    return response.data;
  },
  // Shop
  getMyProducts: async () => {
    const response = await api.get<Product[]>(`products/me`);
    return response.data;
  },
  getProductById: async (id: string) => {
    const response = await api.get<ProductDetail>(`products/${id}`);
    return response.data;
  },
  createProduct: async (data: CreateProductInput) => {
    const response = await api.post<Product>(`products`, data);
    return response.data;
  },
  updateProduct: async (id: string, data: UpdateProductInput) => {
    const response = await api.patch<Product>(`products/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id: string) => {
    const response = await api.delete<Product>(`products/${id}`);
    return response.data;
  },
  updateProductStatus: async (id: string, status: "ACTIVE" | "INACTIVE") => {
    const response = await api.patch<Product>(`products/${id}/status`, {
      status,
    });
    return response.data;
  },
  restoreProduct: async (id: string) => {
    const response = await api.patch<Product>(`products/${id}/restore`);
    return response.data;
  },
  deleteProductPermanent: async (id: string) => {
    const response = await api.delete<Product>(`products/${id}/permanent`);
    return response.data;
  },
  getProductVariants: async (productId: string) => {
    const response = await api.get<ProductVariant[]>(
      `products/${productId}/variants`,
    );
    return response.data;
  },
  uploadThumbnail: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "products");
    const response = await api.post<{ url: string }>("uploads", formData);
    return response.data.url;
  },
};

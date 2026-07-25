import { api } from "@/lib/api";
import type { Category } from "../types/category";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../schemas/category.schema";

export const categoryApi = {
  // PUBLIC
  getAllCategories: async () => {
    const response = await api.get<Category[]>("categories");
    return response.data;
  },
  getCategoryBySlug: async (slug: string) => {
    const response = await api.get<Category>(`categories/${slug}`);
    return response.data;
  },
  // ADMIN
  createCategory: async (data: CreateCategoryInput) => {
    const response = await api.post<Category>(`categories`, data);
    return response.data;
  },
  updateCategory: async (id: string, data: Partial<UpdateCategoryInput>) => {
    const response = await api.patch<Category>(`categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: string) => {
    const response = await api.delete<Category>(`categories/${id}`);
    return response.data;
  },
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "categories");
    const response = await api.post<{ url: string }>("uploads", formData);
    return response.data.url;
  },
};

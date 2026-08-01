export type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "BANNED";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
] as const;

export type ProductSort = (typeof SORT_OPTIONS)[number]["value"];

export interface Product {
  brandId: string | null;
  categoryId: string[];
  // General Info
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  status: ProductStatus;
  // metadata
  metaTitle: string | null;
  metaDescription: string | null;
  // Media
  thumbnail: string | null;
}

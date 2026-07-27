export type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "BANNED";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
] as const;

export type ProductSort = (typeof SORT_OPTIONS)[number]["value"];

export interface VendorProduct {
  id: string;
  name: string;
  sku: string | null;
  thumbnail: string | null;
  status: ProductStatus;
  category: string | null;
  brand: string | null;
}

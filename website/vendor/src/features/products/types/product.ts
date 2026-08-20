export type ProductStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED" | "BANNED";

export const STATUS_BADGE: Record<
  ProductStatus,
  { label: string; className: string }
> = {
  ACTIVE: { label: "Active", className: "bg-success text-white" },
  INACTIVE: {
    label: "Inactive",
    className: "bg-secondary text-secondary-foreground",
  },
  ARCHIVED: {
    label: "Archived",
    className: "bg-secondary text-secondary-foreground",
  },
  BANNED: {
    label: "Banned",
    className: "bg-destructive text-destructive-foreground",
  },
};

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name-asc", label: "Name A–Z" },
  { value: "name-desc", label: "Name Z–A" },
] as const;

export type ProductSort = (typeof SORT_OPTIONS)[number]["value"];

export interface ProductVariant {
  id: string;
  productId: string;
  // General
  name: string;
  slug: string;
  description: string | null;
  // Inventory & Pricing
  sku: string | null;
  price: number;
  stock: number;
  // Metadata
  metaTitle: string | null;
  metaDescription: string | null;
  // Media
  thumbnail: string | null;
  options: Record<string, string>;
  optionsKey: string;
  createdAt: string;
  updatedAt: string;
}

// GET /products/me/variants/:slug — the variant plus just enough of its product
export interface VariantDetail extends ProductVariant {
  images: { id: string; url: string; isMain: boolean }[];
  product: {
    id: string;
    name: string;
    status: ProductStatus;
    optionNames: string[];
  };
}

// GET /products/:id — nested exactly as the API returns it
export interface ProductDetail {
  id: string;
  name: string;
  // General
  status: ProductStatus;
  // Options
  optionNames: string[];
  createdAt: string;
  updatedAt: string;
  brand: { name: string } | null;
  productCategories: { category: { name: string } }[];
  // Variants
  variants: ProductVariant[];
}

export interface Product {
  brandId: string | null;
  categoryId: string[];
  // General Info
  id: string;
  name: string;
  status: ProductStatus;
  // Options
  optionNames: string[];
  createdAt: string;
  updatedAt: string;
  // set once the product is archived (soft-deleted)
  deletedAt: string | null;
}

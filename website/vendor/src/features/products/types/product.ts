export type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "BANNED";

export const STATUS_BADGE: Record<
  ProductStatus,
  { label: string; className: string }
> = {
  ACTIVE: { label: "Active", className: "bg-success text-white" },
  DRAFT: {
    label: "Draft",
    className: "bg-secondary text-secondary-foreground",
  },
  OUT_OF_STOCK: {
    label: "Out of stock",
    className: "bg-warning text-foreground",
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

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ProductVariant {
  id: string;
  productId: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  stock: number;
  metaTitle: string | null;
  metaDescription: string | null;
  thumbnail: string | null;
  options: Record<string, string>;
  optionsKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  brandId: string | null;
  brandName: string | null;
  categories: string[];
  status: ProductStatus;
  approvalStatus: ApprovalStatus;
  rejectedReason: string | null;
  optionNames: string[];
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

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

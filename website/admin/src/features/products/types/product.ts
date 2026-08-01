export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";
export type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "BANNED";

export interface AdminProduct {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string | null;
  status: ProductStatus;
  approvalStatus: ApprovalStatus;
  rejectedReason: string | null;
  thumbnail: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  vendor: { vendorName: string };
}

export interface AdminProductDetail extends AdminProduct {
  vendor: { id: string; vendorName: string };
  brand: { name: string } | null;
  images: { id: string; url: string; isMain: boolean }[];
  productCategories: { id: string; isMain: boolean; category: { name: string } }[];
}

export interface ListProductsParams {
  approvalStatus: ApprovalStatus;
  page: number;
  limit: number;
  search?: string;
}

export interface ListProductsResponse {
  products: AdminProduct[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

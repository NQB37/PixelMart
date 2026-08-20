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

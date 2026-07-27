import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@website/shared/ui";
import { ProductsTable } from "@/features/products/components/ProductsTable";
import { ProductsFilters } from "@/features/products/components/ProductsFilters";
import type {
  ProductSort,
  VendorProduct,
} from "@/features/products/types/product";

// ponytail: static rows + hardcoded filter options — UI only for now, per the
// request. Swap for a useProducts() React Query hook once the list endpoint lands.
const PRODUCTS: VendorProduct[] = [
  {
    id: "1",
    name: "Mechanical Keyboard K7 Pro",
    sku: "KB-K7-PRO",
    thumbnail: null,
    status: "ACTIVE",
    category: "Keyboards",
    brand: "Keychron",
  },
  {
    id: "2",
    name: "27\" 4K IPS Monitor",
    sku: "MN-27-4K",
    thumbnail: null,
    status: "OUT_OF_STOCK",
    category: "Monitors",
    brand: "Dell",
  },
  {
    id: "3",
    name: "Wireless Ergonomic Mouse",
    sku: null,
    thumbnail: null,
    status: "DRAFT",
    category: "Mice",
    brand: "Logitech",
  },
  {
    id: "4",
    name: "USB-C Docking Station 11-in-1",
    sku: "DK-11IN1",
    thumbnail: null,
    status: "BANNED",
    category: "Accessories",
    brand: null,
  },
];

const CATEGORIES = ["Keyboards", "Monitors", "Mice", "Accessories"];
const BRANDS = ["Keychron", "Dell", "Logitech"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState<ProductSort>("newest");

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='font-display text-xl font-semibold text-foreground'>
            Products
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Manage the products listed in your vendor.
          </p>
        </div>
        {/* ponytail: no handler yet — becomes a CreateProductModal trigger */}
        <Button>
          <Plus className='h-4 w-4' /> New Product
        </Button>
      </div>

      <ProductsFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        brand={brand}
        onBrandChange={setBrand}
        sort={sort}
        onSortChange={setSort}
        categories={CATEGORIES}
        brands={BRANDS}
      />

      <div className='overflow-x-auto rounded-xl border border-border bg-card shadow-sm'>
        <ProductsTable
          products={PRODUCTS}
          isLoading={false}
          onEdit={() => {}}
          onDelete={() => {}}
          onToggleStatus={() => {}}
        />
      </div>
    </div>
  );
}

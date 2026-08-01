import { useState } from "react";
import { ProductsTable } from "@/features/products/components/ProductsTable";
import { ProductsFilters } from "@/features/products/components/ProductsFilters";
import type { ProductSort } from "@/features/products/types/product";
import { CreateProductModal } from "@/features/products/components/CreateProductModal";
import { useGetMyProducts } from "@/features/products/hooks/useProduct";

const CATEGORIES = ["Keyboards", "Monitors", "Mice", "Accessories"];
const BRANDS = ["Keychron", "Dell", "Logitech"];

export default function Products() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState<ProductSort>("newest");
  const { data: products, isPending } = useGetMyProducts();

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
        <CreateProductModal />
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
          products={products || []}
          isLoading={isPending}
          onEdit={() => {}}
          onDelete={() => {}}
          onToggleStatus={() => {}}
        />
      </div>
    </div>
  );
}

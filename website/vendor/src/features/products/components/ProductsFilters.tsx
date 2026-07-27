import { Search } from "lucide-react";
import { Input } from "@website/shared/ui";
import { SORT_OPTIONS, type ProductSort } from "../types/product";

const SELECT_CLASS =
  "h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";

interface ProductsFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  sort: ProductSort;
  onSortChange: (value: ProductSort) => void;
  categories: string[];
  brands: string[];
}

export function ProductsFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  brand,
  onBrandChange,
  sort,
  onSortChange,
  categories,
  brands,
}: ProductsFiltersProps) {
  return (
    <div className='flex flex-wrap items-center gap-3'>
      <div className='relative w-full max-w-xs'>
        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          className='pl-9'
          placeholder='Search by name or SKU'
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className={SELECT_CLASS}
        value={category}
        onChange={(e) => onCategoryChange(e.target.value)}
      >
        <option value=''>All categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        className={SELECT_CLASS}
        value={brand}
        onChange={(e) => onBrandChange(e.target.value)}
      >
        <option value=''>All brands</option>
        {brands.map((b) => (
          <option key={b} value={b}>
            {b}
          </option>
        ))}
      </select>

      <select
        className={SELECT_CLASS}
        value={sort}
        onChange={(e) => onSortChange(e.target.value as ProductSort)}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

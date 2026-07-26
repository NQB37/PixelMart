import { Tag } from "lucide-react";
import { UpdateBrandModal } from "./UpdateBrandModal";
import { DeleteBrandModal } from "./DeleteBrandModal";
import type { Brand } from "../types/brand";

interface BrandListProps {
  brands: Brand[];
}

export function BrandList({ brands }: BrandListProps) {
  if (brands.length === 0) {
    return (
      <p className='px-4 py-10 text-center text-sm text-muted-foreground'>
        No brands found.
      </p>
    );
  }

  return (
    <ul>
      {brands.map((brand) => (
        <li key={brand.id}>
          <div className='group flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent/40'>
            <span className='grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground'>
              <Tag className='h-4 w-4' strokeWidth={1.75} />
            </span>

            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-medium text-foreground'>
                {brand.name}
              </p>
              <p className='truncate text-xs text-muted-foreground'>
                /{brand.slug}
              </p>
            </div>

            <div className='flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
              <UpdateBrandModal brand={brand} />
              <DeleteBrandModal brand={brand} />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

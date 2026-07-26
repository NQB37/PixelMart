import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@website/shared/ui";
import { BrandList } from "@/features/brands/components/BrandList";
import { CreateBrandModal } from "@/features/brands/components/CreateBrandModal";
import { useGetAllBrands } from "@/features/brands/hooks/useBrands";

export default function Brands() {
  const { data: brands = [], isLoading } = useGetAllBrands();
  const [search, setSearch] = useState("");

  // ponytail: client-side filter — the endpoint returns every brand already
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((b) => b.name.toLowerCase().includes(q));
  }, [brands, search]);

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <div>
          <h1 className='font-display text-xl font-semibold text-foreground'>
            Brands
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Manage the brands products can be listed under.
          </p>
        </div>
        <CreateBrandModal />
      </div>

      <div className='relative max-w-xs'>
        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          className='pl-9'
          placeholder='Search brands'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className='rounded-xl border border-border bg-card p-2 shadow-sm'>
        {isLoading ? <div>Loading...</div> : <BrandList brands={filtered} />}
      </div>
    </div>
  );
}

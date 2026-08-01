import { useState } from "react";
import { Search } from "lucide-react";
import { Input, Button } from "@website/shared/ui";
import { useProducts } from "@/features/products/hooks/useProducts";
import { ProductsTable } from "@/features/products/components/ProductsTable";

const LIMIT = 10;

export default function ReviewQueue() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useProducts({
    approvalStatus: "PENDING",
    page,
    limit: LIMIT,
    search: search || undefined,
  });

  const meta = data?.meta;

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='font-display text-xl font-semibold text-foreground'>
          Review Queue
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Products submitted by vendors that are waiting for approval.
        </p>
      </div>

      <div className='relative w-full max-w-xs'>
        <Search className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          className='pl-9'
          placeholder='Search by product name or SKU'
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      <div className='overflow-x-auto rounded-xl border border-border bg-card shadow-sm'>
        <ProductsTable products={data?.products ?? []} isLoading={isLoading} />
      </div>

      {meta && meta.totalPages > 1 && (
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} products
          </span>
          <div className='flex gap-2'>
            <Button
              variant='ghost'
              className='px-3 py-1.5 text-xs'
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant='ghost'
              className='px-3 py-1.5 text-xs'
              disabled={page >= meta.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";
import { Search } from "lucide-react";
import { Input, Button, cn } from "@website/shared/ui";
import { useVendors } from "@/features/vendors/hooks/useVendors";
import { VendorsTable } from "@/features/vendors/components/VendorsTable";
import type { ApprovalStatus } from "@/features/vendors/types/vendor";

const TABS: { key: ApprovalStatus; label: string }[] = [
  { key: "APPROVED", label: "Verified" },
  { key: "PENDING", label: "Pending" },
];
const LIMIT = 10;

export default function Vendors() {
  const [tab, setTab] = useState<ApprovalStatus>("APPROVED");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching } = useVendors({
    approvalStatus: tab,
    page,
    limit: LIMIT,
    search: search || undefined,
  });

  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">Vendor Accounts</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review vendor verification requests and manage vendor accounts.
        </p>
      </div>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by vendor name or email"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <VendorsTable vendors={data?.vendors ?? []} isLoading={isLoading} />
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} vendors
          </span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              className="px-3 py-1.5 text-xs"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="ghost"
              className="px-3 py-1.5 text-xs"
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

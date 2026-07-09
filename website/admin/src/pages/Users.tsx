import { useState } from "react";
import { Search } from "lucide-react";
import { Input, PixelButton } from "@website/shared/ui";
import type { UserRole } from "@website/shared/auth";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useUpdateUserStatus } from "@/features/users/hooks/useUpdateUserStatus";
import { UsersTable } from "@/features/users/components/UsersTable";
import type { AdminUser } from "@/features/users/types/user";

const ROLE_OPTIONS: UserRole[] = ["CUSTOMER", "SELLER", "ADMIN", "DELIVERY_PERSON"];
const LIMIT = 10;

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<"" | "true" | "false">("");

  const { data, isLoading, isFetching } = useUsers({
    page,
    limit: LIMIT,
    search: search || undefined,
    role: role || undefined,
    isActive: status === "" ? undefined : status === "true",
  });
  const { mutate: updateStatus, variables, isPending } = useUpdateUserStatus();

  const handleToggleStatus = (user: AdminUser) => {
    if (user.isActive && !window.confirm(`Ban ${user.email}? They will lose access immediately.`)) {
      return;
    }
    updateStatus({ id: user.id, isActive: !user.isActive });
  };

  const meta = data?.meta;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-xl font-semibold text-foreground">All Users</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search, filter, and manage every account on the platform.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
          />
        </div>

        <select
          className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value as UserRole | "");
          }}
        >
          <option value="">All roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <select
          className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={status}
          onChange={(e) => {
            setPage(1);
            setStatus(e.target.value as "" | "true" | "false");
          }}
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Banned</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <UsersTable
          users={data?.users ?? []}
          isLoading={isLoading}
          togglingId={isPending ? variables?.id ?? null : null}
          onToggleStatus={handleToggleStatus}
        />
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Page {meta.page} of {meta.totalPages} · {meta.total} users
          </span>
          <div className="flex gap-2">
            <PixelButton
              variant="ghost"
              className="px-3 py-1.5 text-xs"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </PixelButton>
            <PixelButton
              variant="ghost"
              className="px-3 py-1.5 text-xs"
              disabled={page >= meta.totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </PixelButton>
          </div>
        </div>
      )}
    </div>
  );
}

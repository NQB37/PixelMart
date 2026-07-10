import { useState } from "react";
import { Search } from "lucide-react";
import { Input, PixelButton } from "@website/shared/ui";
import type { UserRole } from "@website/shared/auth";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useUpdateUserStatus } from "@/features/users/hooks/useUpdateUserStatus";
import { useDeleteUser } from "@/features/users/hooks/useDeleteUser";
import { useRestoreUser } from "@/features/users/hooks/useRestoreUser";
import { usePermanentlyDeleteUser } from "@/features/users/hooks/usePermanentlyDeleteUser";
import { UsersTable } from "@/features/users/components/UsersTable";
import { ConfirmModal } from "@/features/users/components/ConfirmModal";
import type { AdminUser } from "@/features/users/types/user";

const ROLE_OPTIONS: UserRole[] = ["CUSTOMER", "SELLER", "ADMIN", "DELIVERY_PERSON"];
const LIMIT = 10;

type ConfirmAction =
  | { type: "ban"; user: AdminUser }
  | { type: "delete"; user: AdminUser }
  | { type: "permanent"; user: AdminUser };

const CONFIRM_COPY = {
  ban: {
    title: (user: AdminUser) => `Ban ${user.email}?`,
    description: "They will lose access to their account immediately.",
    confirmLabel: "Ban user",
    pendingLabel: "Banning…",
  },
  delete: {
    title: (user: AdminUser) => `Delete ${user.email}?`,
    description:
      "The account will be deactivated and hidden from the active list. You can restore it later from the Deleted filter.",
    confirmLabel: "Delete user",
    pendingLabel: "Deleting…",
  },
  permanent: {
    title: (user: AdminUser) => `Permanently delete ${user.email}?`,
    description: "This cannot be undone. The account and its data will be removed for good.",
    confirmLabel: "Permanently delete",
    pendingLabel: "Deleting…",
  },
};

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<"" | "true" | "false" | "deleted">("");
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const { data, isLoading, isFetching } = useUsers({
    page,
    limit: LIMIT,
    search: search || undefined,
    role: role || undefined,
    isActive: status === "" || status === "deleted" ? undefined : status === "true",
    isDeleted: status === "deleted" ? true : undefined,
  });
  const { mutate: updateStatus, variables: statusVars, isPending: isStatusPending } =
    useUpdateUserStatus();
  const { mutate: deleteUser, variables: deleteId, isPending: isDeletePending } = useDeleteUser();
  const { mutate: restoreUser, variables: restoreId, isPending: isRestorePending } =
    useRestoreUser();
  const {
    mutate: permanentlyDeleteUser,
    variables: permanentId,
    isPending: isPermanentPending,
  } = usePermanentlyDeleteUser();

  const handleToggleStatus = (user: AdminUser) => {
    if (user.isActive) {
      setConfirmAction({ type: "ban", user });
      return;
    }
    updateStatus({ id: user.id, isActive: true });
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, user } = confirmAction;
    const onSuccess = () => setConfirmAction(null);
    if (type === "ban") updateStatus({ id: user.id, isActive: false }, { onSuccess });
    if (type === "delete") deleteUser(user.id, { onSuccess });
    if (type === "permanent") permanentlyDeleteUser(user.id, { onSuccess });
  };

  const isConfirmPending =
    confirmAction?.type === "ban"
      ? isStatusPending
      : confirmAction?.type === "delete"
        ? isDeletePending
        : confirmAction?.type === "permanent"
          ? isPermanentPending
          : false;

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
            setStatus(e.target.value as "" | "true" | "false" | "deleted");
          }}
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Banned</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <UsersTable
          users={data?.users ?? []}
          isLoading={isLoading}
          togglingId={isStatusPending ? statusVars?.id ?? null : null}
          deletingId={isDeletePending ? deleteId ?? null : null}
          restoringId={isRestorePending ? restoreId ?? null : null}
          permanentlyDeletingId={isPermanentPending ? permanentId ?? null : null}
          onToggleStatus={handleToggleStatus}
          onDelete={(user) => setConfirmAction({ type: "delete", user })}
          onRestore={(user) => restoreUser(user.id)}
          onPermanentDelete={(user) => setConfirmAction({ type: "permanent", user })}
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

      {confirmAction && (
        <ConfirmModal
          open
          title={CONFIRM_COPY[confirmAction.type].title(confirmAction.user)}
          description={CONFIRM_COPY[confirmAction.type].description}
          confirmLabel={CONFIRM_COPY[confirmAction.type].confirmLabel}
          pendingLabel={CONFIRM_COPY[confirmAction.type].pendingLabel}
          isPending={isConfirmPending}
          onConfirm={handleConfirm}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
}

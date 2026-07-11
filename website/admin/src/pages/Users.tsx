import { useState } from "react";
import type { UserRole } from "@website/shared/auth";
import { useUsers } from "@/features/users/hooks/useUsers";
import { useUpdateUserStatus } from "@/features/users/hooks/useUpdateUserStatus";
import { useRestoreUser } from "@/features/users/hooks/useRestoreUser";
import { UsersTable } from "@/features/users/components/UsersTable";
import { UsersFilters } from "@/features/users/components/UsersFilters";
import { UsersPagination } from "@/features/users/components/UsersPagination";
import { BanUserModal } from "@/features/users/components/BanUserModal";
import { DeleteUserModal } from "@/features/users/components/DeleteUserModal";
import { PermanentDeleteUserModal } from "@/features/users/components/PermanentDeleteUserModal";
import type { AdminUser } from "@/features/users/types/user";

const LIMIT = 10;

export default function Users() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "">("");
  const [status, setStatus] = useState<"" | "true" | "false" | "deleted">("");
  const [banUser, setBanUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [permanentUser, setPermanentUser] = useState<AdminUser | null>(null);

  const { data, isLoading, isFetching } = useUsers({
    page,
    limit: LIMIT,
    search: search || undefined,
    role: role || undefined,
    isActive:
      status === "" || status === "deleted" ? undefined : status === "true",
    isDeleted: status === "deleted" ? true : undefined,
  });
  const {
    mutate: updateStatus,
    variables: statusVars,
    isPending: isStatusPending,
  } = useUpdateUserStatus();
  const {
    mutate: restoreUser,
    variables: restoreId,
    isPending: isRestorePending,
  } = useRestoreUser();

  const handleToggleStatus = (user: AdminUser) => {
    if (user.isActive) {
      setBanUser(user);
      return;
    }
    updateStatus({ id: user.id, isActive: true });
  };

  const meta = data?.meta;

  return (
    <div className='space-y-4'>
      <div>
        <h1 className='font-display text-xl font-semibold text-foreground'>
          All Users
        </h1>
        <p className='mt-1 text-sm text-muted-foreground'>
          Search, filter, and manage every account on the platform.
        </p>
      </div>

      <UsersFilters
        search={search}
        onSearchChange={(v) => {
          setPage(1);
          setSearch(v);
        }}
        role={role}
        onRoleChange={(v) => {
          setPage(1);
          setRole(v);
        }}
        status={status}
        onStatusChange={(v) => {
          setPage(1);
          setStatus(v);
        }}
      />

      <div className='overflow-x-auto rounded-xl border border-border bg-card shadow-sm'>
        <UsersTable
          users={data?.users ?? []}
          isLoading={isLoading}
          togglingId={isStatusPending ? (statusVars?.id ?? null) : null}
          restoringId={isRestorePending ? (restoreId ?? null) : null}
          onToggleStatus={handleToggleStatus}
          onDelete={setDeleteUser}
          onRestore={(user) => restoreUser(user.id)}
          onPermanentDelete={setPermanentUser}
        />
      </div>

      {meta && (
        <UsersPagination
          meta={meta}
          page={page}
          isFetching={isFetching}
          onPrevious={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}

      <BanUserModal user={banUser} onClose={() => setBanUser(null)} />
      <DeleteUserModal user={deleteUser} onClose={() => setDeleteUser(null)} />
      <PermanentDeleteUserModal
        user={permanentUser}
        onClose={() => setPermanentUser(null)}
      />
    </div>
  );
}

import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { Badge, PixelButton, cn } from "@website/shared/ui";
import type { AdminUser } from "../types/user";

const ROLE_BADGE_VARIANT: Record<AdminUser["roles"][number], "default" | "secondary" | "highlight"> = {
  ADMIN: "default",
  SELLER: "highlight",
  CUSTOMER: "secondary",
  DELIVERY_PERSON: "secondary",
};

const columnHelper = createColumnHelper<AdminUser>();

interface UsersTableProps {
  users: AdminUser[];
  isLoading: boolean;
  togglingId: string | null;
  onToggleStatus: (user: AdminUser) => void;
}

export function UsersTable({ users, isLoading, togglingId, onToggleStatus }: UsersTableProps) {
  const columns = [
    columnHelper.display({
      id: "user",
      header: "User",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                (user.fullName || user.email).charAt(0).toUpperCase()
              )}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-foreground">
                {user.fullName || "—"}
              </p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("roles", {
      header: "Roles",
      cell: ({ getValue }) => (
        <div className="flex flex-wrap gap-1">
          {getValue().map((role) => (
            <Badge key={role} variant={ROLE_BADGE_VARIANT[role]}>
              {role}
            </Badge>
          ))}
        </div>
      ),
    }),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: ({ getValue }) =>
        getValue() ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="destructive">Banned</Badge>
        ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Joined",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const user = row.original;
        const isToggling = togglingId === user.id;
        return (
          <PixelButton
            variant={user.isActive ? "ghost" : "green"}
            className={cn(
              "px-3 py-1.5 text-xs",
              user.isActive && "text-destructive hover:bg-destructive/10",
            )}
            disabled={isToggling}
            onClick={() => onToggleStatus(user)}
          >
            {isToggling ? "…" : user.isActive ? "Ban" : "Unban"}
          </PixelButton>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <table className="w-full text-left">
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className="border-b border-border">
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {!isLoading && users.length === 0 && (
          <tr>
            <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-muted-foreground">
              No users found.
            </td>
          </tr>
        )}
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id} className="border-b border-border last:border-0 hover:bg-accent/40">
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className="px-4 py-3">
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

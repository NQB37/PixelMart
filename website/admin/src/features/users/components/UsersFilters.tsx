import { Search } from "lucide-react";
import { Input } from "@website/shared/ui";
import type { UserRole } from "@website/shared/auth";

const ROLE_OPTIONS: UserRole[] = [
  "CUSTOMER",
  "VENDOR",
  "ADMIN",
  "DELIVERY_PERSON",
];

interface UsersFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  role: UserRole | "";
  onRoleChange: (value: UserRole | "") => void;
  status: "" | "true" | "false" | "deleted";
  onStatusChange: (value: "" | "true" | "false" | "deleted") => void;
}

export function UsersFilters({
  search,
  onSearchChange,
  role,
  onRoleChange,
  status,
  onStatusChange,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative w-full max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by name or email"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <select
        className="h-11 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        value={role}
        onChange={(e) => onRoleChange(e.target.value as UserRole | "")}
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
        onChange={(e) =>
          onStatusChange(e.target.value as "" | "true" | "false" | "deleted")
        }
      >
        <option value="">All statuses</option>
        <option value="true">Active</option>
        <option value="false">Banned</option>
        <option value="deleted">Deleted</option>
      </select>
    </div>
  );
}

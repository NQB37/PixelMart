import { useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  BarChart3,
  ChevronsUpDown,
  Flag,
  KeyRound,
  Layers,
  LayoutDashboard,
  LogOut,
  Megaphone,
  PackageSearch,
  PanelLeftClose,
  PanelLeftOpen,
  ScrollText,
  Settings2,
  ShieldCheck,
  Store,
  Tag,
  TrendingUp,
  User,
  Users,
  type LucideIcon,
} from "lucide-react";
import {
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@website/shared/ui";
import { useAuthStore } from "@/features/auth/stores/auth.store";
import { useLogout } from "@/features/auth/hooks/useLogout";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const OVERVIEW: NavItem = { to: "/", label: "Overview", icon: LayoutDashboard };
// ponytail: widened to `string`, same circular-type-resolution quirk noted in the vendor Sidebar.
const PROFILE_PATH: string = "/profile";

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Analytics",
    items: [
      { to: "/analytics/sales", label: "Sales & Revenue", icon: TrendingUp },
      { to: "/analytics/traffic", label: "Traffic & Engagement", icon: BarChart3 },
    ],
  },
  {
    label: "User Management & RBAC",
    items: [
      { to: "/users", label: "All Users", icon: Users },
      { to: "/users/roles", label: "Roles & Permissions", icon: KeyRound },
      { to: "/users/vendors", label: "Vendor Accounts", icon: Store },
    ],
  },
  {
    label: "Catalog Moderation",
    items: [
      { to: "/catalog/review-queue", label: "Review Queue", icon: PackageSearch },
      { to: "/catalog/categories", label: "Categories", icon: Layers },
      { to: "/catalog/brands", label: "Brands", icon: Tag },
      { to: "/catalog/flagged", label: "Flagged Listings", icon: Flag },
    ],
  },
  {
    label: "System & Promotions",
    items: [
      { to: "/system/promotions", label: "Promotions & Vouchers", icon: Megaphone },
      { to: "/system/settings", label: "Site Settings", icon: Settings2 },
      { to: "/system/audit-log", label: "Audit Log", icon: ScrollText },
    ],
  },
];

function NavLink({ item, collapsed }: { item: NavItem; collapsed: boolean }) {
  const { pathname } = useLocation();
  const isActive = pathname === item.to;
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-foreground/70 transition-colors hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-2",
        isActive &&
          "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { mutate: logout } = useLogout();

  const adminLabel = user?.email?.split("@")[0] ?? "Admin";

  return (
    <div className="relative flex shrink-0">
      <aside
        className={cn(
          "flex h-screen shrink-0 flex-col border-r border-border bg-card transition-all duration-200",
          collapsed ? "w-20" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-border px-4",
            collapsed && "justify-center px-0",
          )}
        >
          <Link to="/" className="flex items-center gap-2 overflow-hidden">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
            </span>
            {!collapsed && (
              <span className="truncate font-display text-lg font-bold text-foreground">
                Pixel<span className="text-primary">Mart</span>{" "}
                <span className="text-muted-foreground">Admin</span>
              </span>
            )}
          </Link>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          <NavLink item={OVERVIEW} collapsed={collapsed} />

          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {group.label}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink key={item.to} item={item} collapsed={collapsed} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border p-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md p-2 text-left hover:bg-accent",
                    collapsed && "justify-center",
                  )}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary text-secondary-foreground">
                    <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {adminLabel}
                      </span>
                      <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </>
                  )}
                </button>
              }
            />
            <DropdownMenuContent align="end" side="top" className="w-48">
              <DropdownMenuItem
                render={
                  <Link to={PROFILE_PATH} className="flex items-center gap-2">
                    <User className="h-4 w-4" /> Profile
                  </Link>
                }
              />
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => logout()}
                className="flex items-center gap-2 text-destructive"
              >
                <LogOut className="h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="absolute -right-3 top-8 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-3.5 w-3.5" />
        ) : (
          <PanelLeftClose className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

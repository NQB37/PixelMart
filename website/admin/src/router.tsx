import {
  Navigate,
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Login from "@/pages/Login";
import Forbidden from "@/pages/Forbidden";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Placeholder from "@/pages/Placeholder";
import AdminLayout from "@/components/layout/AdminLayout";
import { hasRole, type UserInfo } from "@website/shared/auth";

interface AuthContext {
  user: UserInfo | null;
  isAuthenticated: boolean;
}

const rootRoute = createRootRouteWithContext<{ auth: AuthContext }>()({
  component: () => <Outlet />,
  notFoundComponent: () => <Navigate to="/" />,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated && context.auth.user) {
      throw redirect({ to: "/" });
    }
  },
  component: Login,
});

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/403",
  component: Forbidden,
});

const adminLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "admin-layout",
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated || !context.auth.user) {
      throw redirect({ to: "/login" });
    }
    if (!hasRole(context.auth.user, ["ADMIN"])) {
      throw redirect({ to: "/403" });
    }
  },
  component: AdminLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/",
  component: Dashboard,
});

const usersRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users",
  component: Users,
});

const placeholderRoute = (path: string, title: string) =>
  createRoute({
    getParentRoute: () => adminLayoutRoute,
    path,
    component: () => <Placeholder title={title} />,
  });

const routeTree = rootRoute.addChildren([
  adminLayoutRoute.addChildren([
    indexRoute,
    placeholderRoute("/analytics/sales", "Sales & Revenue"),
    placeholderRoute("/analytics/traffic", "Traffic & Engagement"),
    usersRoute,
    placeholderRoute("/users/roles", "Roles & Permissions"),
    placeholderRoute("/users/sellers", "Seller Accounts"),
    placeholderRoute("/catalog/review-queue", "Review Queue"),
    placeholderRoute("/catalog/categories", "Categories"),
    placeholderRoute("/catalog/flagged", "Flagged Listings"),
    placeholderRoute("/system/promotions", "Promotions & Vouchers"),
    placeholderRoute("/system/settings", "Site Settings"),
    placeholderRoute("/system/audit-log", "Audit Log"),
    placeholderRoute("/profile", "Profile"),
  ]),
  loginRoute,
  forbiddenRoute,
]);

export const router = createRouter({
  routeTree,
  context: { auth: undefined! },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

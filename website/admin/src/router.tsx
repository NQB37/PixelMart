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
import Vendors from "@/pages/Vendors";
import VendorDetail from "@/pages/VendorDetail";
import Categories from "@/pages/Categories";
import Brands from "@/pages/Brands";
import Placeholder from "@/pages/Placeholder";
import DesignSystem from "@/pages/DesignSystem";
import AdminLayout from "@/components/layout/AdminLayout";
import { hasRole, type UserInfo } from "@website/shared/auth";

interface AuthContext {
  user: UserInfo | null;
  isAuthenticated: boolean;
}

const rootRoute = createRootRouteWithContext<{ auth: AuthContext }>()({
  component: () => <Outlet />,
  notFoundComponent: () => <Navigate to='/' />,
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

const vendorsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users/vendors",
  component: Vendors,
});

const vendorDetailRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/users/vendors/$vendorId",
  component: VendorDetail,
});

const categoriesRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/catalog/categories",
  component: Categories,
});

const brandsRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/catalog/brands",
  component: Brands,
});

const designSystemRoute = createRoute({
  getParentRoute: () => adminLayoutRoute,
  path: "/design-system",
  component: DesignSystem,
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
    vendorsRoute,
    vendorDetailRoute,
    categoriesRoute,
    brandsRoute,
    placeholderRoute("/catalog/flagged", "Flagged Listings"),
    placeholderRoute("/system/promotions", "Promotions & Vouchers"),
    placeholderRoute("/system/settings", "Site Settings"),
    placeholderRoute("/system/audit-log", "Audit Log"),
    placeholderRoute("/profile", "Profile"),
    designSystemRoute,
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

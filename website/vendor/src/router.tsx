import {
  Navigate,
  Outlet,
  createRootRouteWithContext,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterVendor from "@/pages/RegisterVendor";
import Forbidden from "@/pages/Forbidden";
import Dashboard from "@/pages/Dashboard";
import Products from "@/pages/Products";
import ProductDetail from "@/pages/ProductDetail";
import ProductEdit from "@/pages/ProductEdit";
import VariantDetail from "@/pages/VariantDetail";
import Placeholder from "@/pages/Placeholder";
import VendorLayout from "@/components/layout/VendorLayout";
import { hasRole, type UserInfo } from "@website/shared/auth";

interface AuthContext {
  user: UserInfo | null;
  isAuthenticated: boolean;
}

const isVendor = (user: UserInfo) => hasRole(user, ["VENDOR"]);

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

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated && context.auth.user) {
      throw redirect({ to: "/" });
    }
  },
  component: Register,
});

const registerVendorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register-vendor",
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated || !context.auth.user) {
      throw redirect({ to: "/login" });
    }
    // Already a vendor — no need to register again. A vendor whose
    // vendor was *just* approved (role not yet reissued) still falls through
    // to here; RegisterVendor's own effect bounces them once it sees the
    // vendor's approval status, which isn't available synchronously here.
    if (isVendor(context.auth.user)) {
      throw redirect({ to: "/" });
    }
  },
  component: RegisterVendor,
});

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/403",
  component: Forbidden,
});

const vendorLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "vendor-layout",
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated || !context.auth.user) {
      throw redirect({ to: "/login" });
    }
    // Any logged-in account (e.g. a CUSTOMER from the client website) can
    // reach the vendor portal, but must register their vendor first.
    if (!isVendor(context.auth.user)) {
      throw redirect({ to: "/register-vendor" });
    }
  },
  component: VendorLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => vendorLayoutRoute,
  path: "/",
  component: Dashboard,
});

const productsRoute = createRoute({
  getParentRoute: () => vendorLayoutRoute,
  path: "/products",
  component: Products,
});

const productDetailRoute = createRoute({
  getParentRoute: () => vendorLayoutRoute,
  path: "/products/$productId",
  component: ProductDetail,
});

// kept off /products/$productId/variants/$slug — the variant slug is globally
// unique, so the product segment would only make the URL longer
const variantDetailRoute = createRoute({
  getParentRoute: () => vendorLayoutRoute,
  path: "/variants/$slug",
  component: VariantDetail,
});

const productEditRoute = createRoute({
  getParentRoute: () => vendorLayoutRoute,
  path: "/products/$productId/edit",
  component: ProductEdit,
});

const placeholderRoute = (path: string, title: string) =>
  createRoute({
    getParentRoute: () => vendorLayoutRoute,
    path,
    component: () => <Placeholder title={title} />,
  });

const routeTree = rootRoute.addChildren([
  vendorLayoutRoute.addChildren([
    indexRoute,
    placeholderRoute("/analytics/business-insight", "Business Insight"),
    placeholderRoute("/analytics/income", "Income"),
    placeholderRoute("/analytics/bank-account", "Bank Account"),
    placeholderRoute("/orders", "Orders"),
    placeholderRoute("/orders/returns", "Return / Refund / Cancel"),
    productsRoute,
    productDetailRoute,
    productEditRoute,
    variantDetailRoute,
    placeholderRoute("/products/new", "New Product"),
    placeholderRoute("/products/import", "Import Product (CSV)"),
    placeholderRoute("/vouchers", "Vouchers"),
    placeholderRoute("/chat", "Chat Management"),
    placeholderRoute("/reviews", "Review Management"),
    placeholderRoute("/profile", "Profile"),
  ]),
  loginRoute,
  registerRoute,
  registerVendorRoute,
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

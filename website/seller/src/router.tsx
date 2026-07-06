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
import RegisterShop from "@/pages/RegisterShop";
import Forbidden from "@/pages/Forbidden";
import Dashboard from "@/pages/Dashboard";
import { hasRole, type UserInfo } from "@pixelmart/shared/auth";

interface AuthContext {
  user: UserInfo | null;
  isAuthenticated: boolean;
}

const isSeller = (user: UserInfo) => hasRole(user, ["SELLER", "ADMIN"]);

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

const registerShopRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register-shop",
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated || !context.auth.user) {
      throw redirect({ to: "/login" });
    }
    // Already a seller — no need to register a shop again.
    if (isSeller(context.auth.user)) {
      throw redirect({ to: "/" });
    }
  },
  component: RegisterShop,
});

const forbiddenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/403",
  component: Forbidden,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  beforeLoad: ({ context }) => {
    if (!context.auth.isAuthenticated || !context.auth.user) {
      throw redirect({ to: "/login" });
    }
    // Any logged-in account (e.g. a CUSTOMER from the client website) can
    // reach the seller portal, but must register their shop first.
    if (!isSeller(context.auth.user)) {
      throw redirect({ to: "/register-shop" });
    }
  },
  component: Dashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  registerRoute,
  registerShopRoute,
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

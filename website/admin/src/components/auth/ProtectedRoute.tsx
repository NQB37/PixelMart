import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!user.roles.includes("ADMIN")) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export default function GuestRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAuthenticated } = useAuthStore();

  if (isAuthenticated && user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

import { RoleGuard } from "@/features/auth";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // require authentication; pass allowedRoles to restrict a route to a role
  return (
    <RoleGuard>
      <main>{children}</main>
    </RoleGuard>
  );
}

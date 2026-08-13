import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@website/shared/ui";
import AuthShell from "@/features/auth/components/AuthShell";
import RegisterVendorForm from "@/features/vendor/components/RegisterVendorForm";
import { useMyVendor } from "@/features/vendor/hooks/useMyVendor";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { authApi } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export default function RegisterVendor() {
  const navigate = useNavigate();
  const { data: vendor, isLoading } = useMyVendor();
  const { mutate: logout } = useLogout();
  const setAuth = useAuthStore((state) => state.setAuth);
  const hasRefreshed = useRef(false);

  useEffect(() => {
    // The VENDOR role is only granted once an admin approves the vendor. The
    // current access token predates that, so it must be reissued to pick up
    // the new role before heading to the (role-gated) dashboard.
    // Guarded by a ref (not just the effect deps) because refresh tokens are
    // single-use — React StrictMode's double-invoke would otherwise fire two
    // concurrent refresh calls and the loser trips the backend's reuse
    // detection, wiping the session.
    if (vendor?.approvalStatus === "APPROVED" && !hasRefreshed.current) {
      hasRefreshed.current = true;
      authApi.refreshToken().then(({ accessToken, user }) => {
        setAuth(user, accessToken);
        navigate({ to: "/", replace: true });
      });
    }
  }, [vendor, navigate, setAuth]);

  // Avoid flashing the registration wizard while the vendor's actual status
  // is still loading — it would otherwise land on "step 1" before this
  // resolves to the pending/approved state.
  if (isLoading) {
    return null;
  }

  if (vendor?.approvalStatus === "PENDING") {
    return (
      <AuthShell heading='Registration submitted' description=''>
        <div className='flex flex-col items-center py-4 text-center'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success'>
            <CheckCircle2 className='h-8 w-8' strokeWidth={1.5} />
          </div>
          <p className='text-sm text-muted-foreground'>
            Your vendor account is pending review. We&apos;ll notify you once our team
            approves it.
          </p>
          <Button
            variant='ghost'
            className='mt-6 w-full border border-input'
            onClick={() => logout()}
          >
            Log out
          </Button>
        </div>
      </AuthShell>
    );
  }

  return <RegisterVendorForm />;
}

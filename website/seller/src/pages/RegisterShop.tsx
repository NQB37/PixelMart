import { useEffect, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@website/shared/ui";
import AuthShell from "@/features/auth/components/AuthShell";
import RegisterShopForm from "@/features/shop/components/RegisterShopForm";
import { useMyShop } from "@/features/shop/hooks/useMyShop";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { authApi } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export default function RegisterShop() {
  const navigate = useNavigate();
  const { data: shop, isLoading } = useMyShop();
  const { mutate: logout } = useLogout();
  const setAuth = useAuthStore((state) => state.setAuth);
  const hasRefreshed = useRef(false);

  useEffect(() => {
    // The SELLER role is only granted once an admin approves the shop. The
    // current access token predates that, so it must be reissued to pick up
    // the new role before heading to the (role-gated) dashboard.
    // Guarded by a ref (not just the effect deps) because refresh tokens are
    // single-use — React StrictMode's double-invoke would otherwise fire two
    // concurrent refresh calls and the loser trips the backend's reuse
    // detection, wiping the session.
    if (shop?.approvalStatus === "APPROVED" && !hasRefreshed.current) {
      hasRefreshed.current = true;
      authApi.refreshToken().then(async ({ accessToken }) => {
        const user = await authApi.getMe();
        setAuth(user, accessToken);
        navigate({ to: "/", replace: true });
      });
    }
  }, [shop, navigate, setAuth]);

  // Avoid flashing the registration wizard while the shop's actual status
  // is still loading — it would otherwise land on "step 1" before this
  // resolves to the pending/approved state.
  if (isLoading) {
    return null;
  }

  if (shop?.approvalStatus === "PENDING") {
    return (
      <AuthShell heading='Registration submitted' description=''>
        <div className='flex flex-col items-center py-4 text-center'>
          <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-success/15 text-success'>
            <CheckCircle2 className='h-8 w-8' strokeWidth={1.5} />
          </div>
          <p className='text-sm text-muted-foreground'>
            Your shop is pending review. We&apos;ll notify you once our team
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

  return <RegisterShopForm />;
}

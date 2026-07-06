import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { shopApi } from "../services/shop.service";
import { authApi } from "@/features/auth/services/auth.service";
import { useAuthStore } from "@/features/auth/stores/auth.store";

export function useRegisterShop() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: shopApi.register,
    onSuccess: async () => {
      // The current access token was issued before the SELLER role existed,
      // so it must be reissued to pick up the new role from the DB.
      const { accessToken } = await authApi.refreshToken();
      const user = await authApi.getMe();
      setAuth(user, accessToken);
      navigate({ to: "/", replace: true });
    },
  });
}

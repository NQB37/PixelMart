import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { authApi } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken);
      navigate({ to: "/", replace: true });
    },
  });
}

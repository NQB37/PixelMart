import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/auth.service";
import { useAuthStore } from "../stores/auth.store";

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: Parameters<typeof authApi.login>[0]) => {
      const res = await authApi.login(data);
      if (!res.user.roles.includes("ADMIN")) {
        throw new Error("Access denied: this account is not an admin");
      }
      return res;
    },
    onSuccess: (res) => {
      setAuth(res.user, res.accessToken);
      navigate("/", { replace: true });
    },
  });
}

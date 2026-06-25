import { useRouter } from "next/navigation";
import { authApi } from "../services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { toast } from "react-toastify";

export const useLogout = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Logout failed!");
    },
  });
};

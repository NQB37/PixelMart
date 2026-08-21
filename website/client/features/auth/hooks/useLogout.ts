import { useRouter } from "next/navigation";
import { authApi } from "../services/auth.service";
import { getErrorMessage } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { toast } from "react-toastify";

export const useLogout = () => {
  const router = useRouter();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      router.push("/");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Logout failed!"));
    },
  });
};

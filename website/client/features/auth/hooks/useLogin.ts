import { useRouter } from "next/navigation";
import { authApi } from "../services/auth.service";
import { getErrorMessage } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { toast } from "react-toastify";

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      router.push("/");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Login failed!"));
    },
  });
};

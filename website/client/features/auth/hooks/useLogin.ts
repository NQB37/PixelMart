import { useRouter } from "next/navigation";
import { authApi } from "../services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { toast } from "react-toastify";

export const useLogin = () => {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      console.log(data);
      setAuth(data.user, data.accessToken);
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Đăng nhập thất bại");
    },
  });
};

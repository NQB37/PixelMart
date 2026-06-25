import { authApi } from "../services/auth.service";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "../stores/auth.store";
import { toast } from "react-toastify";

export const useRefresh = () => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  return useMutation({
    mutationFn: authApi.refreshToken,
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Refresh token failed!");
    },
  });
};

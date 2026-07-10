import { useMutation } from "@tanstack/react-query";
import { shopApi } from "../services/shop.service";

export function useRegisterShop() {
  return useMutation({
    mutationFn: shopApi.register,
  });
}

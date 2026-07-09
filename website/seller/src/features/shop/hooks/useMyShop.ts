import { useQuery } from "@tanstack/react-query";
import { shopApi } from "../services/shop.service";

export function useMyShop() {
  return useQuery({
    queryKey: ["shop", "me"],
    queryFn: shopApi.getMyShop,
  });
}

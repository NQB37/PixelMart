import { useQuery } from "@tanstack/react-query";
import { shopApi } from "../services/shop.service";

export function useShopDetail(id: string) {
  return useQuery({
    queryKey: ["shops", id],
    queryFn: () => shopApi.getDetail(id),
  });
}

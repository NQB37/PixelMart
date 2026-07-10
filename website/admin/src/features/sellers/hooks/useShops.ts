import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { shopApi } from "../services/shop.service";
import type { ListShopsParams } from "../types/shop";

export function useShops(params: ListShopsParams) {
  return useQuery({
    queryKey: ["shops", params],
    queryFn: () => shopApi.list(params),
    placeholderData: keepPreviousData,
  });
}

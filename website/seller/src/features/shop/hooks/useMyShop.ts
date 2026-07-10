import { useQuery } from "@tanstack/react-query";
import { shopApi } from "../services/shop.service";

export function useMyShop() {
  return useQuery({
    queryKey: ["shop", "me"],
    queryFn: shopApi.getMyShop,
    // A 404 here just means "no shop yet" — a real answer, not a transient
    // failure, so don't retry it or refetch it every time the tab refocuses.
    retry: false,
    refetchOnWindowFocus: false,
  });
}

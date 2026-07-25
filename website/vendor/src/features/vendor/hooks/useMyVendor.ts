import { useQuery } from "@tanstack/react-query";
import { vendorApi } from "../services/vendor.service";

export function useMyVendor() {
  return useQuery({
    queryKey: ["vendor", "me"],
    queryFn: vendorApi.getMyVendor,
    // A 404 here just means "no vendor yet" — a real answer, not a transient
    // failure, so don't retry it or refetch it every time the tab refocuses.
    retry: false,
    refetchOnWindowFocus: false,
  });
}

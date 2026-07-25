import { useQuery } from "@tanstack/react-query";
import { vendorApi } from "../services/vendor.service";

export function useVendorDetail(id: string) {
  return useQuery({
    queryKey: ["vendors", id],
    queryFn: () => vendorApi.getDetail(id),
  });
}

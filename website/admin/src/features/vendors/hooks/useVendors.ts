import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { vendorApi } from "../services/vendor.service";
import type { ListVendorsParams } from "../types/vendor";

export function useVendors(params: ListVendorsParams) {
  return useQuery({
    queryKey: ["vendors", params],
    queryFn: () => vendorApi.list(params),
    placeholderData: keepPreviousData,
  });
}

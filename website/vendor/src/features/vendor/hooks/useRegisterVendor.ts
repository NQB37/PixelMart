import { useMutation } from "@tanstack/react-query";
import { vendorApi } from "../services/vendor.service";

export function useRegisterVendor() {
  return useMutation({
    mutationFn: vendorApi.register,
  });
}

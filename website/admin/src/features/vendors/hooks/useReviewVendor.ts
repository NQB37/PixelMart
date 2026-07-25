import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vendorApi } from "../services/vendor.service";

type ReviewInput = { action: "approve" } | { action: "reject"; rejectedReason: string };

export function useReviewVendor(vendorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReviewInput) =>
      input.action === "approve"
        ? vendorApi.approve(vendorId)
        : vendorApi.reject(vendorId, input.rejectedReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendors"] });
    },
  });
}

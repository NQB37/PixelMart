import { useMutation, useQueryClient } from "@tanstack/react-query";
import { shopApi } from "../services/shop.service";

type ReviewInput = { action: "approve" } | { action: "reject"; rejectedReason: string };

export function useReviewShop(shopId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReviewInput) =>
      input.action === "approve"
        ? shopApi.approve(shopId)
        : shopApi.reject(shopId, input.rejectedReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });
}

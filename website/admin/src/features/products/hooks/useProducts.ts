import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../services/product.service";
import type { ListProductsParams } from "../types/product";

type ReviewInput = { action: "approve" } | { action: "reject"; rejectedReason: string };

export function useProducts(params: ListProductsParams) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => productApi.list(params),
    placeholderData: keepPreviousData,
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productApi.getDetail(id),
  });
}

export function useReviewProduct(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReviewInput) =>
      input.action === "approve"
        ? productApi.approve(productId)
        : productApi.reject(productId, input.rejectedReason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

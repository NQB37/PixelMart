import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../services/product.service";

export function useGetMyProducts() {
  return useQuery({
    queryKey: ["products", "me"],
    queryFn: productApi.getMyProducts,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: productApi.createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandApi } from "../services/brand.service";
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from "../schemas/brand.schema";

export function useGetAllBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: brandApi.getAllBrands,
  });
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBrandInput) => brandApi.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useUpdateBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBrandInput }) =>
      brandApi.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

export function useDeleteBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => brandApi.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["brands"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productApi } from "../services/product.service";
import type {
  CreateVariantInput,
  UpdateProductInput,
} from "../schemas/product.schema";

// Product
export function useGetMyProducts() {
  return useQuery({
    queryKey: ["products", "me"],
    queryFn: productApi.getMyProducts,
  });
}

export function useGetProductById(productId: string) {
  return useQuery({
    queryKey: ["products", productId],
    queryFn: () => productApi.getProductById(productId),
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

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    // the endpoint replaces the whole record — a partial patch would wipe
    // the brand and keep the old categories, so send every field every time
    mutationFn: (input: { productId: string; data: UpdateProductInput }) =>
      productApi.updateProduct(input.productId, input.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productApi.deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { productId: string; status: "ACTIVE" | "INACTIVE" }) =>
      productApi.updateProductStatus(input.productId, input.status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useRestoreProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => productApi.restoreProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProductPermanent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) =>
      productApi.deleteProductPermanent(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Variant
export function useGetProductVariants(productId: string) {
  return useQuery({
    queryKey: ["products", productId, "variants"],
    queryFn: () => productApi.getProductVariants(productId),
  });
}

export function useCreateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVariantInput & { thumbnail?: string }) =>
      productApi.createProductVariant(productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      variantId: string;
      data: CreateVariantInput & { thumbnail?: string };
    }) =>
      productApi.updateProductVariant(productId, input.variantId, input.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteVariant(productId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variantId: string) =>
      productApi.deleteProductVariant(productId, variantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

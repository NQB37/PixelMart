import { productApi } from "../services/product.service";
import { useQuery } from "@tanstack/react-query";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: productApi.getAllProducts,
  });
};

export const useProductBySlug = (slug: string) => {
  return useQuery({
    queryKey: ["products", slug],
    queryFn: () => productApi.getProductBySlug(slug),
  });
};

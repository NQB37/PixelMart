import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "../services/catalog.service";

export function useGetAllBrands() {
  return useQuery({
    queryKey: ["brands"],
    queryFn: catalogApi.getAllBrands,
  });
}

export function useGetAllCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: catalogApi.getAllCategories,
  });
}

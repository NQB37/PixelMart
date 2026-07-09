import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { userApi } from "../services/user.service";
import type { ListUsersParams } from "../types/user";

export function useUsers(params: ListUsersParams) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userApi.list(params),
    placeholderData: keepPreviousData,
  });
}

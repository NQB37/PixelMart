import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../services/user.service";

export function useRestoreUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.restore(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

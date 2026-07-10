import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../services/user.service";

export function usePermanentlyDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.permanentlyDelete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

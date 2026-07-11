import { useDeleteUser } from "../hooks/useDeleteUser";
import { ConfirmModal } from "./ConfirmModal";
import type { AdminUser } from "../types/user";

interface DeleteUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function DeleteUserModal({ user, onClose }: DeleteUserModalProps) {
  const { mutate, isPending } = useDeleteUser();

  const handleConfirm = () => {
    if (!user) return;
    mutate(user.id, { onSuccess: onClose });
  };

  return (
    <ConfirmModal
      open={!!user}
      title={user ? `Delete ${user.email}?` : ""}
      description="The account will be deactivated and hidden from the active list. You can restore it later from the Deleted filter."
      confirmLabel="Delete user"
      pendingLabel="Deleting…"
      isPending={isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}

import { usePermanentlyDeleteUser } from "../hooks/usePermanentlyDeleteUser";
import { ConfirmModal } from "./ConfirmModal";
import type { AdminUser } from "../types/user";

interface PermanentDeleteUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function PermanentDeleteUserModal({
  user,
  onClose,
}: PermanentDeleteUserModalProps) {
  const { mutate, isPending } = usePermanentlyDeleteUser();

  const handleConfirm = () => {
    if (!user) return;
    mutate(user.id, { onSuccess: onClose });
  };

  return (
    <ConfirmModal
      open={!!user}
      title={user ? `Permanently delete ${user.email}?` : ""}
      description="This cannot be undone. The account and its data will be removed for good."
      confirmLabel="Permanently delete"
      pendingLabel="Deleting…"
      isPending={isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}

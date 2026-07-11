import { useUpdateUserStatus } from "../hooks/useUpdateUserStatus";
import { ConfirmModal } from "./ConfirmModal";
import type { AdminUser } from "../types/user";

interface BanUserModalProps {
  user: AdminUser | null;
  onClose: () => void;
}

export function BanUserModal({ user, onClose }: BanUserModalProps) {
  const { mutate, isPending } = useUpdateUserStatus();

  const handleConfirm = () => {
    if (!user) return;
    mutate({ id: user.id, isActive: false }, { onSuccess: onClose });
  };

  return (
    <ConfirmModal
      open={!!user}
      title={user ? `Ban ${user.email}?` : ""}
      description="They will lose access to their account immediately."
      confirmLabel="Ban user"
      pendingLabel="Banning…"
      isPending={isPending}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
}

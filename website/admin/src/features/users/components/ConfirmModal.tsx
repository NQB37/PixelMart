import { useEffect, useRef } from "react";
import { Button, Spinner } from "@website/shared/ui";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  pendingLabel: string;
  isPending: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  pendingLabel,
  isPending,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none place-items-center bg-transparent p-4 open:grid backdrop:bg-black/50"
    >
      {open && (
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-foreground shadow-lg">
          <h2 className="font-display text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button variant="ghost" disabled={isPending} onClick={onClose}>
              Cancel
            </Button>
            <Button
              className="bg-highlight text-highlight-foreground hover:bg-highlight/90"
              disabled={isPending}
              onClick={onConfirm}
            >
              {isPending && <Spinner />}
              {isPending ? pendingLabel : confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </dialog>
  );
}

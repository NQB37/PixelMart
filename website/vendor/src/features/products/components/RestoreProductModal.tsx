import { ArchiveRestore } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Spinner,
} from "@website/shared/ui";
import { toast } from "react-toastify";
import { STATUS_BADGE, type Product } from "../types/product";
import { useRestoreProduct } from "../hooks/useProduct";

interface RestoreProductModalProps {
  product: Product;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Controlled for the same reason as DeleteProductModal: opened from a dropdown
// menu item, which unmounts any trigger inside it on click.
export function RestoreProductModal({
  product,
  open,
  onOpenChange,
}: RestoreProductModalProps) {
  const { mutateAsync: restoreProduct, isPending } = useRestoreProduct();
  const status = STATUS_BADGE[product.status];

  const handleRestore = async () => {
    try {
      await restoreProduct(product.id);
      toast.success(`Product ${product.name} restored as a draft`);
      onOpenChange(false);
    } catch {
      // api client already toasts the error — keep the modal open to retry
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader className='flex-row items-start gap-3 space-y-0 pr-8'>
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'>
            <ArchiveRestore className='h-5 w-5' strokeWidth={1.75} />
          </span>
          <div className='space-y-1.5'>
            <DialogTitle>Restore product?</DialogTitle>
            <DialogDescription>
              It comes back as an Inactive draft — publish it again when you're
              ready for it to be listed.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3'>
          <div className='min-w-0 flex-1'>
            <p className='truncate font-display text-sm font-semibold text-foreground'>
              {product.name}
            </p>
            <p className='truncate font-mono text-xs text-muted-foreground'>
              {product.id}
            </p>
          </div>
          <Badge className={`shrink-0 ${status.className}`}>
            {status.label}
          </Badge>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type='button' disabled={isPending} onClick={handleRestore}>
            {isPending && <Spinner />}
            {isPending ? "Restoring…" : "Restore product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

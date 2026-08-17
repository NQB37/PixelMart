import { Trash2 } from "lucide-react";
import {
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
import type { ProductVariant } from "../types/product";
import { useDeleteVariant } from "../hooks/useProduct";

interface DeleteVariantModalProps {
  productId: string;
  variant: ProductVariant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Controlled for the same reason as DeleteProductModal: opened from a dropdown
// menu item, which unmounts any trigger inside it on click.
export function DeleteVariantModal({
  productId,
  variant,
  open,
  onOpenChange,
}: DeleteVariantModalProps) {
  const { mutateAsync: deleteVariant, isPending } = useDeleteVariant(productId);
  const options = Object.entries(variant.options)
    .map(([name, value]) => `${name}: ${value}`)
    .join(" · ");

  const handleDelete = async () => {
    try {
      await deleteVariant(variant.id);
      toast.success(`Variant ${variant.slug} deleted`);
      onOpenChange(false);
    } catch {
      // api client already toasts the error — keep the modal open to retry
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-md'>
        <DialogHeader className='flex-row items-start gap-3 space-y-0 pr-8'>
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive'>
            <Trash2 className='h-5 w-5' strokeWidth={1.75} />
          </span>
          <div className='space-y-1.5'>
            <DialogTitle>Delete variant?</DialogTitle>
            <DialogDescription>
              It stops being sellable and its images go with it. This can't be
              undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3'>
          <div className='min-w-0 flex-1'>
            <p className='truncate font-display text-sm font-semibold text-foreground'>
              {options || variant.slug}
            </p>
            <p className='truncate font-mono text-xs text-muted-foreground'>
              {variant.sku || variant.slug}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending && <Spinner />}
            {isPending ? "Deleting…" : "Delete variant"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

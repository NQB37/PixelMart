import { useState } from "react";
import { Archive, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Spinner,
} from "@website/shared/ui";
import { toast } from "react-toastify";
import { STATUS_BADGE, type Product } from "../types/product";
import {
  useDeleteProduct,
  useDeleteProductPermanent,
} from "../hooks/useProduct";

interface DeleteProductModalProps {
  product: Product;
  /** Hard delete (row is gone) instead of the archiving soft delete. */
  permanent?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Controlled rather than self-contained: it is opened from a dropdown menu
// item, and Base UI closes the menu (unmounting any trigger inside it) on click.
export function DeleteProductModal({
  product,
  permanent = false,
  open,
  onOpenChange,
}: DeleteProductModalProps) {
  const [confirmName, setConfirmName] = useState("");
  const softDelete = useDeleteProduct();
  const hardDelete = useDeleteProductPermanent();
  const { mutateAsync: deleteProduct, isPending } = permanent
    ? hardDelete
    : softDelete;
  // A hard delete takes its variants and orders history with it — make the
  // vendor spell the name out first.
  const canDelete = !permanent || confirmName.trim() === product.name;
  const status = STATUS_BADGE[product.status];

  const handleDelete = async () => {
    try {
      await deleteProduct(product.id);
      toast.success(
        permanent
          ? `Product ${product.name} deleted permanently`
          : `Product ${product.name} archived`,
      );
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
            {permanent ? (
              <Trash2 className='h-5 w-5' strokeWidth={1.75} />
            ) : (
              <Archive className='h-5 w-5' strokeWidth={1.75} />
            )}
          </span>
          <div className='space-y-1.5'>
            <DialogTitle>
              {permanent ? "Delete product forever?" : "Archive product?"}
            </DialogTitle>
            <DialogDescription>
              {permanent
                ? "This wipes the product and every variant under it. This can't be undone."
                : "It stops being listed and stays here marked Archived. Restoring it isn't available yet."}
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

        <form
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault();
            if (canDelete) handleDelete();
          }}
        >
          {permanent && (
            <div>
              {/* inline: the label is a sentence, not the registry's icon+text flex row */}
              <Label htmlFor='delete-product-confirm' className='inline'>
                Type{" "}
                <span className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>
                  {product.name}
                </span>{" "}
                to confirm
              </Label>
              <Input
                id='delete-product-confirm'
                className='mt-1.5'
                autoComplete='off'
                autoFocus
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              variant='destructive'
              disabled={!canDelete || isPending}
            >
              {isPending && <Spinner />}
              {permanent
                ? isPending
                  ? "Deleting…"
                  : "Delete forever"
                : isPending
                  ? "Archiving…"
                  : "Archive product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

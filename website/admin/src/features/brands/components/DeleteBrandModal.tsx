import { useState } from "react";
import { Tag, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@website/shared/ui";
import { toast } from "react-toastify";
import { useDeleteBrand } from "../hooks/useBrands";
import type { Brand } from "../types/brand";

interface DeleteBrandModalProps {
  brand: Brand;
}

export function DeleteBrandModal({ brand }: DeleteBrandModalProps) {
  const [isOpened, setIsOpened] = useState(false);
  const { mutateAsync: deleteBrand, isPending } = useDeleteBrand();

  const handleDelete = async () => {
    try {
      await deleteBrand(brand.id);
      toast.success(`Brand ${brand.name} deleted successfully`);
      setIsOpened(false);
    } catch {
      // api client already toast error, keep modal open
    }
  };

  return (
    <Dialog open={isOpened} onOpenChange={setIsOpened}>
      <DialogTrigger
        render={
          <Button
            variant='ghost'
            className='p-2 text-destructive hover:bg-destructive/10'
            title='Delete brand'
            aria-label='Delete brand'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        }
      />

      <DialogContent className='max-w-md'>
        <DialogHeader className='flex-row items-start gap-3 space-y-0 pr-8'>
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive'>
            <Trash2 className='h-5 w-5' strokeWidth={1.75} />
          </span>
          <div className='space-y-1.5'>
            <DialogTitle>Delete brand?</DialogTitle>
            <DialogDescription>
              Brands with products can&apos;t be deleted. This can&apos;t be
              undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3'>
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-md bg-secondary text-secondary-foreground'>
            <Tag className='h-4 w-4' strokeWidth={1.75} />
          </span>
          <div className='min-w-0 flex-1'>
            <p className='truncate font-display text-sm font-semibold text-foreground'>
              {brand.name}
            </p>
            <p className='truncate font-mono text-xs text-muted-foreground'>
              /{brand.slug}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setIsOpened(false)}
          >
            Cancel
          </Button>
          <Button
            type='button'
            variant='destructive'
            disabled={isPending}
            onClick={handleDelete}
          >
            {isPending ? "Deleting…" : "Delete brand"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

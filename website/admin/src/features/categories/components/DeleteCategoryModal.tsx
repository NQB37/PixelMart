import { useState } from "react";
import { Layers, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
} from "@website/shared/ui";
import { toast } from "react-toastify";
import { collectIds } from "../utils/categoryTree";
import { useDeleteCategory } from "../hooks/useCategories";
import type { CategoryNode } from "../types/category";

interface DeleteCategoryModalProps {
  node: CategoryNode;
}

export function DeleteCategoryModal({ node }: DeleteCategoryModalProps) {
  const [isOpened, setIsOpened] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const { mutateAsync: deleteCategory, isPending } = useDeleteCategory();
  const childCount = collectIds(node).length - 1;
  const canDelete = confirmName.trim() === node.name;

  const handleOpenChange = (next: boolean) => {
    if (next) setConfirmName("");
    setIsOpened(next);
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(node.id);
      toast.success(`Category ${node.name} deleted successfully`);
      setIsOpened(false);
    } catch {
      // api client already toast error, keep modal open
    }
  };

  return (
    <Dialog open={isOpened} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant='ghost'
            className='p-2 text-destructive hover:bg-destructive/10'
            title='Delete category'
            aria-label='Delete category'
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
            <DialogTitle>Delete category?</DialogTitle>
            <DialogDescription>
              {childCount > 0
                ? `This also deletes the ${childCount} subcategor${childCount === 1 ? "y" : "ies"} nested under it. `
                : ""}
              This can&apos;t be undone.
            </DialogDescription>
          </div>
        </DialogHeader>

        {/* The row from the tree, lifted — confirm against the object, not a quoted string. */}
        <div className='flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3'>
          <span className='grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary text-secondary-foreground'>
            {node.imageUrl ? (
              <img
                src={node.imageUrl}
                alt={node.name}
                className='h-full w-full object-contain'
              />
            ) : (
              <Layers className='h-4 w-4' strokeWidth={1.75} />
            )}
          </span>
          <div className='min-w-0 flex-1'>
            <p className='truncate font-display text-sm font-semibold text-foreground'>
              {node.name}
            </p>
            <p className='truncate font-mono text-xs text-muted-foreground'>
              /{node.slug}
            </p>
          </div>
          {childCount > 0 && (
            <Badge className='shrink-0 bg-warning text-foreground'>
              {childCount} sub
            </Badge>
          )}
        </div>

        <form
          className='space-y-4'
          onSubmit={(e) => {
            e.preventDefault();
            if (canDelete) handleDelete();
          }}
        >
          <div>
            {/* inline: the label is a sentence, not the registry's icon+text flex row */}
            <Label htmlFor='delete-category-confirm' className='inline'>
              Type{" "}
              <span className='rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground'>
                {node.name}
              </span>{" "}
              to confirm
            </Label>
            <Input
              id='delete-category-confirm'
              className='mt-1.5'
              autoComplete='off'
              autoFocus
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
            />
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
              type='submit'
              variant='destructive'
              disabled={!canDelete || isPending}
            >
              {isPending ? "Deleting…" : "Delete category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

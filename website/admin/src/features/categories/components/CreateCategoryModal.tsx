import { useState } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  FieldError,
  ImageDropzone,
  Input,
  Label,
} from "@website/shared/ui";
import { flattenForParentSelect } from "../utils/categoryTree";
import type { CategoryNode } from "../types/category";
import { useCreateCategory } from "../hooks/useCategories";
import { categoryApi } from "../services/category.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "../schemas/category.schema";
import { toast } from "react-toastify";

interface CreateCategoryModalProps {
  tree: CategoryNode[];
  parent?: CategoryNode;
}

export function CreateCategoryModal({
  tree,
  parent,
}: CreateCategoryModalProps) {
  const { mutateAsync: createCategory } = useCreateCategory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
  });

  const [isOpened, setIsOpened] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const parentOptions = flattenForParentSelect(tree);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      reset();
      setImage(null);
    }
    setIsOpened(next);
  };

  const onSubmit = async (data: CreateCategoryInput) => {
    try {
      const imageUrl = image ? await categoryApi.uploadImage(image) : undefined;
      await createCategory({
        ...data,
        imageUrl,
        parentId: parent?.id ?? (data.parentId || undefined),
      });
      toast.success(`Category ${data.name} created successfully`);
      setIsOpened(false);
    } catch {
      // api client already toast error
      // keep the modal open to allow user to try again
    }
  };

  return (
    <Dialog open={isOpened} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {parent ? (
          <Button
            variant='ghost'
            className='p-2'
            title='Add subcategory'
            aria-label='Add subcategory'
          >
            <Plus className='h-4 w-4' />
          </Button>
        ) : (
          <Button>
            <Plus className='h-4 w-4' /> Add category
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className='flex-row items-start gap-3 space-y-0 pr-8'>
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'>
            <Plus className='h-5 w-5' strokeWidth={1.75} />
          </span>
          <div className='space-y-1.5'>
            <DialogTitle>
              {parent ? "Add subcategory" : "Add category"}
            </DialogTitle>
            <DialogDescription>
              {parent ? (
                <>
                  Nested under{" "}
                  <span className='font-medium text-foreground'>
                    {parent.name}
                  </span>
                  .
                </>
              ) : (
                "Top-level unless you pick a parent below."
              )}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='create-category-name'>
              Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='create-category-name'
              className='mt-1.5'
              placeholder='e.g. Smartphones'
              autoFocus
              {...register("name")}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor='create-category-description'>Description</Label>
            <textarea
              id='create-category-description'
              className='mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring'
              rows={3}
              placeholder='Optional short description'
              {...register("description")}
            />
            <FieldError>{errors.description?.message}</FieldError>
          </div>

          <ImageDropzone
            label='Category image'
            file={image}
            onChange={setImage}
            hint='PNG or JPG, up to 5MB'
          />

          {parent ? null : (
            <div>
              <Label htmlFor='create-category-parent'>Parent category</Label>
              <select
                id='create-category-parent'
                className='mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring'
                {...register("parentId")}
              >
                <option value=''>— None (top-level) —</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpened(false)}
            >
              Cancel
            </Button>
            <Button type='submit' loading={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

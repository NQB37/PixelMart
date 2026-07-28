import { useState } from "react";
import { Pencil } from "lucide-react";
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
  Spinner,
} from "@website/shared/ui";
import { flattenForParentSelect } from "../utils/categoryTree";
import { slugify } from "@website/shared/utils";
import type { CategoryNode } from "../types/category";
import { useUpdateCategory } from "../hooks/useCategories";
import { categoryApi } from "../services/category.service";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  updateCategorySchema,
  type UpdateCategoryInput,
} from "../schemas/category.schema";
import { toast } from "react-toastify";

interface UpdateCategoryModalProps {
  category: CategoryNode;
  tree: CategoryNode[];
}

export function UpdateCategoryModal({
  category,
  tree,
}: UpdateCategoryModalProps) {
  const { mutateAsync: updateCategory } = useUpdateCategory();
  const defaultValues = {
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    parentId: category.parentId ?? "",
  };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateCategoryInput>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues,
  });

  const [isOpened, setIsOpened] = useState(false);
  const [image, setImage] = useState<File | null>(null);

  const parentOptions = flattenForParentSelect(tree, category.id);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      reset(defaultValues);
      setImage(null);
    }
    setIsOpened(next);
  };

  const onSubmit = async (data: UpdateCategoryInput) => {
    try {
      const imageUrl = image
        ? await categoryApi.uploadImage(image)
        : category.imageUrl;
      await updateCategory({
        id: category.id,
        data: {
          ...data,
          slug: data.slug ? slugify(data.slug) : undefined,
          description: data.description?.trim() || undefined,
          imageUrl,
          parentId: data.parentId || null,
        },
      });
      toast.success(`Category ${data.name} updated successfully`);
      setIsOpened(false);
    } catch {
      // api client already toast error
      // keep the modal open to allow user to try again
    }
  };

  return (
    <Dialog open={isOpened} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button
            variant='ghost'
            className='p-2'
            title='Edit category'
            aria-label='Edit category'
          >
            <Pencil className='h-4 w-4' />
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader className='flex-row items-start gap-3 space-y-0 pr-8'>
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'>
            <Pencil className='h-5 w-5' strokeWidth={1.75} />
          </span>
          <div className='space-y-1.5'>
            <DialogTitle>Edit category</DialogTitle>
            <DialogDescription>
              Editing{" "}
              <span className='font-medium text-foreground'>
                {category.name}
              </span>
              .
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='edit-category-name'>
              Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='edit-category-name'
              className='mt-1.5'
              placeholder='e.g. Smartphones'
              autoFocus
              {...register("name", {
                onChange: (e) => setValue("slug", slugify(e.target.value)),
              })}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor='edit-category-slug'>Slug</Label>
            <Input
              id='edit-category-slug'
              className='mt-1.5 font-mono'
              placeholder='e.g. smartphones'
              {...register("slug")}
            />
            <p className='mt-1.5 text-xs text-muted-foreground'>
              Used in the category URL. Changing it breaks existing links.
            </p>
          </div>

          <div>
            <Label htmlFor='edit-category-description'>Description</Label>
            <textarea
              id='edit-category-description'
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

          <div>
            <Label htmlFor='edit-category-parent'>Parent category</Label>
            <select
              id='edit-category-parent'
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

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpened(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

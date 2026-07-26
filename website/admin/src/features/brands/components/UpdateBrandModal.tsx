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
  Input,
  Label,
} from "@website/shared/ui";
import { slugify } from "@website/shared/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useUpdateBrand } from "../hooks/useBrands";
import {
  updateBrandSchema,
  type UpdateBrandInput,
} from "../schemas/brand.schema";
import type { Brand } from "../types/brand";

interface UpdateBrandModalProps {
  brand: Brand;
}

export function UpdateBrandModal({ brand }: UpdateBrandModalProps) {
  const { mutateAsync: updateBrand } = useUpdateBrand();
  const defaultValues = { name: brand.name, slug: brand.slug };
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UpdateBrandInput>({
    resolver: zodResolver(updateBrandSchema),
    defaultValues,
  });

  const [isOpened, setIsOpened] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) reset(defaultValues);
    setIsOpened(next);
  };

  const onSubmit = async (data: UpdateBrandInput) => {
    try {
      await updateBrand({
        id: brand.id,
        data: {
          ...data,
          slug: data.slug ? slugify(data.slug) : undefined,
        },
      });
      toast.success(`Brand ${data.name} updated successfully`);
      setIsOpened(false);
    } catch {
      // api client already toast error
      // keep the modal open to allow user to try again
    }
  };

  return (
    <Dialog open={isOpened} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant='ghost'
          className='p-2'
          title='Edit brand'
          aria-label='Edit brand'
        >
          <Pencil className='h-4 w-4' />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className='flex-row items-start gap-3 space-y-0 pr-8'>
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'>
            <Pencil className='h-5 w-5' strokeWidth={1.75} />
          </span>
          <div className='space-y-1.5'>
            <DialogTitle>Edit brand</DialogTitle>
            <DialogDescription>
              Editing{" "}
              <span className='font-medium text-foreground'>{brand.name}</span>.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='edit-brand-name'>
              Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='edit-brand-name'
              className='mt-1.5'
              placeholder='e.g. Logitech'
              autoFocus
              {...register("name", {
                onChange: (e) => setValue("slug", slugify(e.target.value)),
              })}
            />
            <FieldError>{errors.name?.message}</FieldError>
          </div>

          <div>
            <Label htmlFor='edit-brand-slug'>Slug</Label>
            <Input
              id='edit-brand-slug'
              className='mt-1.5 font-mono'
              placeholder='e.g. logitech'
              {...register("slug")}
            />
            <p className='mt-1.5 text-xs text-muted-foreground'>
              Used in the brand URL. Changing it breaks existing links.
            </p>
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpened(false)}
            >
              Cancel
            </Button>
            <Button type='submit' loading={isSubmitting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

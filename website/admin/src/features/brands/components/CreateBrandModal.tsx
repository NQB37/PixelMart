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
  Input,
  Label,
} from "@website/shared/ui";
import { slugify } from "@website/shared/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { useCreateBrand } from "../hooks/useBrands";
import {
  createBrandSchema,
  type CreateBrandInput,
} from "../schemas/brand.schema";

export function CreateBrandModal() {
  const { mutateAsync: createBrand } = useCreateBrand();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreateBrandInput>({
    resolver: zodResolver(createBrandSchema),
  });

  const [isOpened, setIsOpened] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) reset();
    setIsOpened(next);
  };

  const onSubmit = async (data: CreateBrandInput) => {
    try {
      await createBrand({ ...data, slug: slugify(data.slug) });
      toast.success(`Brand ${data.name} created successfully`);
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
          <Button>
            <Plus className='h-4 w-4' /> Add brand
          </Button>
        }
      />

      <DialogContent>
        <DialogHeader className='flex-row items-start gap-3 space-y-0 pr-8'>
          <span className='grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary'>
            <Plus className='h-5 w-5' strokeWidth={1.75} />
          </span>
          <div className='space-y-1.5'>
            <DialogTitle>Add brand</DialogTitle>
            <DialogDescription>
              The slug is filled in from the name — edit it if you need to.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <div>
            <Label htmlFor='create-brand-name'>
              Name <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='create-brand-name'
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
            <Label htmlFor='create-brand-slug'>
              Slug <span className='text-destructive'>*</span>
            </Label>
            <Input
              id='create-brand-slug'
              className='mt-1.5 font-mono'
              placeholder='e.g. logitech'
              {...register("slug")}
            />
            <FieldError>{errors.slug?.message}</FieldError>
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
              {isSubmitting ? "Creating…" : "Create brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

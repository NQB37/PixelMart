import { useState } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-toastify";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  ImageDropzone,
  Spinner,
} from "@website/shared/ui";
import {
  createVariantSchema,
  type CreateVariantInput,
} from "../schemas/product.schema";
import { useCreateVariant } from "../hooks/useProduct";
import { productApi } from "../services/product.service";
import { VariantFormFields } from "./VariantFormFields";

interface CreateVariantModalProps {
  productId: string;
  optionNames: string[];
}

export function CreateVariantModal({
  productId,
  optionNames,
}: CreateVariantModalProps) {
  const { mutateAsync: createVariant } = useCreateVariant(productId);
  const emptyVariant: CreateVariantInput = {
    slug: "",
    sku: "",
    price: 0,
    stock: 0,
    options: Object.fromEntries(optionNames.map((name) => [name, ""])),
  };
  const form = useForm<CreateVariantInput>({
    resolver: zodResolver(createVariantSchema),
    defaultValues: emptyVariant,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const [isOpened, setIsOpened] = useState(false);
  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (next) {
      reset(emptyVariant);
      setThumbnail(null);
    }
    setIsOpened(next);
  };

  const onSubmit = async (data: CreateVariantInput) => {
    try {
      const thumbnailUrl = thumbnail
        ? await productApi.uploadThumbnail(thumbnail)
        : undefined;
      await createVariant({
        ...data,
        // an empty SKU would be stored as "" and block the next blank one
        sku: data.sku || undefined,
        thumbnail: thumbnailUrl,
      });
      toast.success(`Variant ${data.slug} created successfully`);
      setIsOpened(false);
    } catch {
      // api client already toasts the error — keep the modal open to retry
    }
  };

  return (
    <Dialog open={isOpened} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button>
            <Plus className='h-4 w-4' />
            Add variant
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add variant</DialogTitle>
          <DialogDescription>
            One combination of the product's options, with its own price, stock
            and image.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <VariantFormFields form={form} optionNames={optionNames} />

          <ImageDropzone
            label='Variant image'
            file={thumbnail}
            onChange={setThumbnail}
            hint='PNG or JPG, up to 5MB'
          />

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpened(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || optionNames.length === 0}
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Creating…" : "Create variant"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

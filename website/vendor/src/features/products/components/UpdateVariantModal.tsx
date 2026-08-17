import { useState } from "react";
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
  ImageDropzone,
  Spinner,
} from "@website/shared/ui";
import {
  createVariantSchema,
  type CreateVariantInput,
} from "../schemas/product.schema";
import type { ProductVariant } from "../types/product";
import { useUpdateVariant } from "../hooks/useProduct";
import { productApi } from "../services/product.service";
import { VariantFormFields } from "./VariantFormFields";

interface UpdateVariantModalProps {
  productId: string;
  variant: ProductVariant;
  optionNames: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Controlled for the same reason as DeleteVariantModal: opened from a dropdown
// menu item, which unmounts any trigger inside it on click. It mounts per
// variant, so defaultValues seed the form — no prop-into-state effect needed.
export function UpdateVariantModal({
  productId,
  variant,
  optionNames,
  open,
  onOpenChange,
}: UpdateVariantModalProps) {
  const { mutateAsync: updateVariant } = useUpdateVariant(productId);
  const form = useForm<CreateVariantInput>({
    resolver: zodResolver(createVariantSchema),
    defaultValues: {
      slug: variant.slug,
      sku: variant.sku ?? "",
      price: variant.price,
      stock: variant.stock,
      // keyed off the product's option names, so a renamed option starts blank
      options: Object.fromEntries(
        optionNames.map((name) => [name, variant.options[name] ?? ""]),
      ),
    },
  });
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = form;

  const [thumbnail, setThumbnail] = useState<File | null>(null);

  const onSubmit = async (data: CreateVariantInput) => {
    try {
      // no new file picked → leave `thumbnail` out and the current one stands
      const thumbnailUrl = thumbnail
        ? await productApi.uploadThumbnail(thumbnail)
        : undefined;
      await updateVariant({
        variantId: variant.id,
        data: { ...data, sku: data.sku || undefined, thumbnail: thumbnailUrl },
      });
      toast.success(`Variant ${data.slug} updated successfully`);
      onOpenChange(false);
    } catch {
      // api client already toasts the error — keep the modal open to retry
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit variant</DialogTitle>
          <DialogDescription>
            Changing the options moves this variant to another combination — it
            must stay unique within the product.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <VariantFormFields form={form} optionNames={optionNames} />

          <div className='flex items-end gap-3'>
            {variant.thumbnail && (
              <img
                src={variant.thumbnail}
                alt=''
                className='h-32 w-32 shrink-0 rounded-md border border-input object-contain'
              />
            )}
            <ImageDropzone
              className='flex-1'
              label={variant.thumbnail ? "Replace image" : "Variant image"}
              file={thumbnail}
              onChange={setThumbnail}
              hint='PNG or JPG, up to 5MB'
            />
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type='submit'
              disabled={isSubmitting || optionNames.length === 0}
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

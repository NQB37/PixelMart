import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Spinner,
} from "@website/shared/ui";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  createProductSchema,
  type CreateProductInput,
} from "../schemas/product.schema";
import { useCreateProduct } from "../hooks/useProduct";
import { ProductFormFields } from "./ProductFormFields";

const EMPTY_PRODUCT: CreateProductInput = { name: "", optionNames: [] };

export function CreateProductModal() {
  const { mutateAsync: createProduct } = useCreateProduct();
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: EMPTY_PRODUCT,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = form;

  const [isOpened, setIsOpened] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next) reset(EMPTY_PRODUCT);
    setIsOpened(next);
  };

  const onSubmit = async (data: CreateProductInput) => {
    try {
      await createProduct(data);
      toast.success(`Product ${data.name} created successfully`);
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
            <Plus className='h-4 w-4' /> New Product
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Product</DialogTitle>
          <DialogDescription>
            Create a new product by filling in the form below. Pricing, SKU and
            images live on its variants.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
          <ProductFormFields form={form} />
          <DialogFooter className='pt-4'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsOpened(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isSubmitting}>
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

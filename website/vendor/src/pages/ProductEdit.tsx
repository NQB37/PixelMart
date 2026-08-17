import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";
import {
  Badge,
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  Spinner,
} from "@website/shared/ui";
import { ProductFormFields } from "@/features/products/components/ProductFormFields";
import {
  useGetMyProducts,
  useUpdateProduct,
} from "@/features/products/hooks/useProduct";
import {
  updateProductSchema,
  type UpdateProductInput,
} from "@/features/products/schemas/product.schema";
import { STATUS_BADGE, type Product } from "@/features/products/types/product";

const STATUS_ITEMS = [
  { value: "ACTIVE", label: "Active — listed on the storefront" },
  { value: "INACTIVE", label: "Inactive — hidden from shoppers" },
] as const;

function EditProductForm({ product }: { product: Product }) {
  const navigate = useNavigate();
  const { mutateAsync: updateProduct } = useUpdateProduct();
  const form = useForm<UpdateProductInput>({
    resolver: zodResolver(updateProductSchema),
    defaultValues: {
      name: product.name,
      brandId: product.brandId ?? undefined,
      categoryId: product.categoryId,
      optionNames: product.optionNames,
      // archived/banned products aren't editable, so the switch only has two sides
      status: product.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
    },
  });
  const {
    handleSubmit,
    formState: { isSubmitting, isDirty },
  } = form;

  const onSubmit = async (data: UpdateProductInput) => {
    try {
      await updateProduct({ productId: product.id, data });
      toast.success(`Product ${data.name} updated successfully`);
      navigate({ to: "/products" });
    } catch {
      // api client already toasts the error — keep the form open to retry
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div className='space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm'>
        <ProductFormFields form={form} />

        <Controller
          control={form.control}
          name='status'
          render={({ field }) => (
            <div className='space-y-1.5'>
              <Label htmlFor='product-status'>Status</Label>
              <Select
                items={STATUS_ITEMS}
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(value as UpdateProductInput["status"])
                }
              >
                <SelectTrigger id='product-status'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />

        <p className='text-xs text-muted-foreground'>
          Clearing every category isn&apos;t saved yet — the product keeps the
          categories it has now.
        </p>
      </div>

      <div className='flex justify-end gap-2'>
        <Button
          type='button'
          variant='outline'
          render={<Link to='/products' />}
        >
          Cancel
        </Button>
        <Button type='submit' disabled={isSubmitting || !isDirty}>
          {isSubmitting && <Spinner />}
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

export default function ProductEdit() {
  const { productId } = useParams({
    from: "/vendor-layout/products/$productId/edit",
  });
  // ponytail: the vendor product list is a single unpaginated request and is
  // already cached by /products — no need for a second by-id endpoint yet.
  const { data: products, isPending } = useGetMyProducts();
  const product = products?.find((p) => p.id === productId);

  return (
    <div className='space-y-5'>
      <Link
        to='/products'
        className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground'
      >
        <ArrowLeft className='h-4 w-4' />
        Products
      </Link>

      {isPending ? (
        <div className='space-y-4'>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-72 w-full rounded-xl' />
        </div>
      ) : !product ? (
        <p className='rounded-xl border border-border bg-card p-10 text-center text-sm text-muted-foreground'>
          Product not found.
        </p>
      ) : (
        <>
          <div className='flex flex-wrap items-start justify-between gap-3'>
            <div>
              <h1 className='font-display text-xl font-semibold text-foreground'>
                Edit {product.name}
              </h1>
              <div className='mt-2 flex flex-wrap items-center gap-2'>
                <Badge className={STATUS_BADGE[product.status].className}>
                  {STATUS_BADGE[product.status].label}
                </Badge>
              </div>
            </div>
          </div>

          <EditProductForm product={product} />
        </>
      )}
    </div>
  );
}

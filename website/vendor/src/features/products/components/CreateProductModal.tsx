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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from "@website/shared/ui";
import { slugify } from "@website/shared/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";
import { toast } from "react-toastify";
import {
  createProductSchema,
  type CreateProductInput,
} from "../schemas/product.schema";
import { useCreateProduct } from "../hooks/useProduct";
import { useGetAllBrands, useGetAllCategories } from "../hooks/useCatalog";
import { productApi } from "../services/product.service";

type ProductForm = UseFormReturn<CreateProductInput>;

const GeneralProductTab = ({
  form: {
    register,
    setValue,
    control,
    formState: { errors },
  },
  thumbnail,
  onThumbnailChange,
}: {
  form: ProductForm;
  thumbnail: File | null;
  onThumbnailChange: (file: File | null) => void;
}) => {
  const { data: brands = [] } = useGetAllBrands();
  const { data: categories = [] } = useGetAllCategories();
  // `items` is what makes the trigger render the name for the selected id.
  const brandItems = brands.map((b) => ({ value: b.id, label: b.name }));
  const categoryItems = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  return (
    <TabsContent value='general' keepMounted className='space-y-4 pt-2'>
      <div className='space-y-1.5'>
        <Label htmlFor='create-product-name'>Name *</Label>
        <Input
          id='create-product-name'
          placeholder='e.g. Mechanical Keyboard K7 Pro'
          autoFocus
          aria-invalid={!!errors.name}
          {...register("name", {
            onChange: (e) => setValue("slug", slugify(e.target.value)),
          })}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='create-product-slug'>Slug *</Label>
        <Input
          id='create-product-slug'
          className='font-mono'
          placeholder='e.g. mechanical-keyboard-k7-pro'
          aria-invalid={!!errors.slug}
          {...register("slug")}
        />
        <FieldError>{errors.slug?.message}</FieldError>
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='create-product-sku'>SKU</Label>
        <Input
          id='create-product-sku'
          placeholder='e.g. KB-K7-PRO'
          aria-invalid={!!errors.sku}
          {...register("sku")}
        />
        <FieldError>{errors.sku?.message}</FieldError>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Controller
          control={control}
          name='brandId'
          render={({ field, fieldState }) => (
            <div className='space-y-1.5'>
              <Label htmlFor='create-product-brand'>Brand</Label>
              <Select
                items={brandItems}
                value={field.value ?? null}
                onValueChange={(id) => field.onChange(id as string)}
              >
                <SelectTrigger
                  id='create-product-brand'
                  aria-invalid={!!fieldState.error}
                >
                  <SelectValue placeholder='Select a brand' />
                </SelectTrigger>
                <SelectContent>
                  {brandItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{fieldState.error?.message}</FieldError>
            </div>
          )}
        />

        <Controller
          control={control}
          name='categoryId'
          render={({ field, fieldState }) => (
            <div className='space-y-1.5'>
              <Label htmlFor='create-product-category'>Category</Label>
              <Select
                items={categoryItems}
                value={field.value?.[0] ?? null}
                // ponytail: server takes a list; one category is enough for now
                onValueChange={(id) => field.onChange([id as string])}
              >
                <SelectTrigger
                  id='create-product-category'
                  aria-invalid={!!fieldState.error}
                >
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {categoryItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError>{fieldState.error?.message}</FieldError>
            </div>
          )}
        />
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='create-product-description'>Description</Label>
        <Textarea
          id='create-product-description'
          rows={3}
          placeholder='What makes this product worth buying?'
          {...register("description")}
        />
        <FieldError>{errors.description?.message}</FieldError>
      </div>

      <ImageDropzone
        label='Thumbnail'
        file={thumbnail}
        onChange={onThumbnailChange}
        hint='PNG or JPG, up to 5MB'
      />
    </TabsContent>
  );
};

const MetadataProductTab = ({
  form: {
    register,
    formState: { errors },
  },
}: {
  form: ProductForm;
}) => {
  return (
    <TabsContent value='metadata' keepMounted className='space-y-4 pt-2'>
      <div className='space-y-1.5'>
        <Label htmlFor='create-product-meta-title'>Meta title</Label>
        <Input
          id='create-product-meta-title'
          placeholder='Shown as the page title in search results'
          aria-invalid={!!errors.metaTitle}
          {...register("metaTitle")}
        />
        <FieldError>{errors.metaTitle?.message}</FieldError>
      </div>

      <div className='space-y-1.5'>
        <Label htmlFor='create-product-meta-description'>
          Meta description
        </Label>
        <Textarea
          id='create-product-meta-description'
          rows={3}
          placeholder='Short summary shown under the title in search results'
          {...register("metaDescription")}
        />
        <FieldError>{errors.metaDescription?.message}</FieldError>
      </div>
    </TabsContent>
  );
};

export function CreateProductModal() {
  const { mutateAsync: createProduct } = useCreateProduct();
  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
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
      reset();
      setThumbnail(null);
    }
    setIsOpened(next);
  };

  const onSubmit = async (data: CreateProductInput) => {
    try {
      const thumbnailUrl = thumbnail
        ? await productApi.uploadThumbnail(thumbnail)
        : undefined;
      await createProduct({
        ...data,
        slug: slugify(data.slug),
        thumbnail: thumbnailUrl,
      });
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
            Create a new product by filling in the form below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue='general'>
            <TabsList>
              <TabsTrigger value='general'>General Info</TabsTrigger>
              <TabsTrigger value='metadata'>Meta Data</TabsTrigger>
            </TabsList>
            <GeneralProductTab
              form={form}
              thumbnail={thumbnail}
              onThumbnailChange={setThumbnail}
            />
            <MetadataProductTab form={form} />
          </Tabs>
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

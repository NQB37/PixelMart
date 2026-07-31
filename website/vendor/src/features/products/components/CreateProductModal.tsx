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
  Label,
  SelectField,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
  TextField,
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

  return (
    <TabsContent value='general' keepMounted className='space-y-4 pt-2'>
      <TextField
        label='Name *'
        placeholder='e.g. Mechanical Keyboard K7 Pro'
        autoFocus
        error={errors.name?.message}
        {...register("name", {
          onChange: (e) => setValue("slug", slugify(e.target.value)),
        })}
      />

      <TextField
        label='Slug *'
        className='font-mono'
        placeholder='e.g. mechanical-keyboard-k7-pro'
        error={errors.slug?.message}
        {...register("slug")}
      />

      <TextField
        label='SKU'
        placeholder='e.g. KB-K7-PRO'
        error={errors.sku?.message}
        {...register("sku")}
      />

      <div className='grid gap-4 sm:grid-cols-2'>
        <Controller
          control={control}
          name='brandId'
          render={({ field, fieldState }) => (
            <SelectField
              label='Brand'
              placeholder='Select a brand'
              options={brands}
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
            />
          )}
        />

        <Controller
          control={control}
          name='categoryId'
          render={({ field, fieldState }) => (
            <SelectField
              label='Category'
              placeholder='Select a category'
              options={categories}
              value={field.value?.[0]}
              // ponytail: server takes a list; one category is enough for now
              onChange={(id) => field.onChange([id])}
              error={fieldState.error?.message}
            />
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
      <TextField
        label='Meta title'
        placeholder='Shown as the page title in search results'
        error={errors.metaTitle?.message}
        {...register("metaTitle")}
      />

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

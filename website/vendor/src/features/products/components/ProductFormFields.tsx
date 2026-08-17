import { Controller, type UseFormReturn } from "react-hook-form";
import { ChevronDown, Plus, X } from "lucide-react";
import {
  Button,
  cn,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  FieldError,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@website/shared/ui";
import type { CreateProductInput } from "../schemas/product.schema";
import { useGetAllBrands, useGetAllCategories } from "../hooks/useCatalog";

// Create and update share these four fields — update just adds `status` on top,
// hence the generic (react-hook-form's types aren't covariant, so one cast).
export function ProductFormFields<T extends CreateProductInput>({
  form,
}: {
  form: UseFormReturn<T>;
}) {
  const {
    register,
    control,
    formState: { errors },
  } = form as unknown as UseFormReturn<CreateProductInput>;
  const { data: brands = [] } = useGetAllBrands();
  const { data: categories = [] } = useGetAllCategories();
  // `items` is what makes the trigger render the name for the selected id.
  const brandItems = brands.map((b) => ({ value: b.id, label: b.name }));
  const categoryItems = categories.map((c) => ({ value: c.id, label: c.name }));

  return (
    <>
      <div className='space-y-1.5'>
        <Label htmlFor='product-name'>Name *</Label>
        <Input
          id='product-name'
          placeholder='e.g. Mechanical Keyboard K7 Pro'
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <Controller
          control={control}
          name='brandId'
          render={({ field, fieldState }) => (
            <div className='space-y-1.5'>
              <Label htmlFor='product-brand'>Brand</Label>
              <Select
                items={brandItems}
                value={field.value ?? null}
                onValueChange={(id) => field.onChange(id as string)}
              >
                <SelectTrigger
                  id='product-brand'
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
          render={({ field, fieldState }) => {
            const selected = field.value ?? [];
            const toggle = (id: string) =>
              field.onChange(
                selected.includes(id)
                  ? selected.filter((c) => c !== id)
                  : [...selected, id],
              );

            return (
              <div className='space-y-1.5'>
                <Label htmlFor='product-category'>Categories</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type='button'
                        id='product-category'
                        aria-invalid={!!fieldState.error}
                        className='flex h-11 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background aria-invalid:border-destructive'
                      >
                        <span
                          className={cn(
                            "truncate",
                            !selected.length && "text-muted-foreground",
                          )}
                        >
                          {selected.length
                            ? categories
                                .filter((c) => selected.includes(c.id))
                                .map((c) => c.name)
                                .join(", ")
                            : "Select categories"}
                        </span>
                        <ChevronDown className='size-4 shrink-0 text-muted-foreground' />
                      </button>
                    }
                  />
                  <DropdownMenuContent className='max-h-64 w-(--anchor-width) overflow-y-auto'>
                    {categoryItems.map((item) => (
                      <DropdownMenuCheckboxItem
                        key={item.value}
                        checked={selected.includes(item.value)}
                        onCheckedChange={() => toggle(item.value)}
                      >
                        {item.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <FieldError>{fieldState.error?.message}</FieldError>
              </div>
            );
          }}
        />
      </div>

      <Controller
        control={control}
        name='optionNames'
        render={({ field }) => {
          const options = field.value ?? [];

          return (
            <div className='space-y-1.5'>
              <Label>Option names</Label>
              <p className='text-xs text-muted-foreground'>
                The axes every variant is defined by — e.g. Color, Storage.
              </p>
              {options.map((option, index) => (
                <div key={index} className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Input
                      value={option}
                      placeholder='e.g. Color'
                      aria-label={`Option name ${index + 1}`}
                      aria-invalid={!!errors.optionNames?.[index]}
                      onChange={(e) =>
                        field.onChange(
                          options.map((o, i) =>
                            i === index ? e.target.value : o,
                          ),
                        )
                      }
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon-sm'
                      aria-label={`Remove option ${index + 1}`}
                      onClick={() =>
                        field.onChange(options.filter((_, i) => i !== index))
                      }
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                  <FieldError>
                    {errors.optionNames?.[index]?.message}
                  </FieldError>
                </div>
              ))}
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => field.onChange([...options, ""])}
              >
                <Plus className='h-4 w-4' /> Add option
              </Button>
            </div>
          );
        }}
      />
    </>
  );
}

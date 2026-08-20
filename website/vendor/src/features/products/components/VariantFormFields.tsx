import { Controller, type UseFormReturn } from "react-hook-form";
import { FieldError, Input, Label } from "@website/shared/ui";
import type { CreateVariantInput } from "../schemas/product.schema";

// Shared by CreateVariantModal and UpdateVariantModal — the image lives in each
// modal instead, since only the edit form has a current one to show.
export function VariantFormFields({
  form,
  optionNames,
}: {
  form: UseFormReturn<CreateVariantInput>;
  optionNames: string[];
}) {
  const {
    register,
    control,
    formState: { errors },
  } = form;

  return (
    <>
      <div className='space-y-1.5'>
        <Label htmlFor='variant-name'>
          Name <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='variant-name'
          placeholder='e.g. Keyboard K7 Pro — Red'
          aria-invalid={!!errors.name}
          {...register("name")}
        />
        <FieldError>{errors.name?.message}</FieldError>
      </div>

      {optionNames.length === 0 ? (
        <p className='rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground'>
          This product has no option names yet — edit the product and add at
          least one (e.g. Color) first.
        </p>
      ) : (
        <Controller
          control={control}
          name='options'
          render={({ field }) => (
            <div className='grid gap-4 sm:grid-cols-2'>
              {optionNames.map((name) => (
                <div key={name} className='space-y-1.5'>
                  <Label htmlFor={`variant-option-${name}`}>
                    {name} <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id={`variant-option-${name}`}
                    placeholder={`e.g. ${name === "Color" ? "Red" : name}`}
                    aria-invalid={!!errors.options?.[name]}
                    value={field.value?.[name] ?? ""}
                    onChange={(e) =>
                      field.onChange({ ...field.value, [name]: e.target.value })
                    }
                  />
                  <FieldError>{errors.options?.[name]?.message}</FieldError>
                </div>
              ))}
            </div>
          )}
        />
      )}

      <div className='space-y-1.5'>
        <Label htmlFor='variant-slug'>
          Slug <span className='text-destructive'>*</span>
        </Label>
        <Input
          id='variant-slug'
          className='font-mono'
          placeholder='e.g. keyboard-k7-pro-red'
          aria-invalid={!!errors.slug}
          {...register("slug")}
        />
        <p className='text-xs text-muted-foreground'>
          Its public URL — unique across every product.
        </p>
        <FieldError>{errors.slug?.message}</FieldError>
      </div>

      <div className='grid gap-4 sm:grid-cols-3'>
        <div className='space-y-1.5'>
          <Label htmlFor='variant-price'>
            Price <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='variant-price'
            type='number'
            min={0}
            aria-invalid={!!errors.price}
            {...register("price", { valueAsNumber: true })}
          />
          <FieldError>{errors.price?.message}</FieldError>
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='variant-stock'>
            Stock <span className='text-destructive'>*</span>
          </Label>
          <Input
            id='variant-stock'
            type='number'
            min={0}
            step={1}
            aria-invalid={!!errors.stock}
            {...register("stock", { valueAsNumber: true })}
          />
          <FieldError>{errors.stock?.message}</FieldError>
        </div>
        <div className='space-y-1.5'>
          <Label htmlFor='variant-sku'>SKU</Label>
          <Input
            id='variant-sku'
            className='font-mono'
            placeholder='Optional'
            aria-invalid={!!errors.sku}
            {...register("sku")}
          />
          <FieldError>{errors.sku?.message}</FieldError>
        </div>
      </div>
    </>
  );
}

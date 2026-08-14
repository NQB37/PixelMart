import { ImageIcon, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@website/shared/ui";
import type { ProductVariant } from "../types/product";

const price = (cents: number) => `$${cents.toLocaleString("en-US")}`;

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) {
    return <Badge variant='destructive'>Out of stock</Badge>;
  }
  if (stock <= 10) {
    return <Badge className='bg-warning text-foreground'>Low · {stock}</Badge>;
  }
  return <span className='text-sm tabular-nums text-foreground/80'>{stock}</span>;
}

interface ProductVariantsTableProps {
  optionNames: string[];
  variants: ProductVariant[];
}

export function ProductVariantsTable({
  optionNames,
  variants,
}: ProductVariantsTableProps) {
  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-sm text-muted-foreground'>
          {variants.length} variant{variants.length === 1 ? "" : "s"} ·
          options: {optionNames.join(", ") || "—"}
        </p>
        <Button>
          <Plus className='h-4 w-4' />
          Add variant
        </Button>
      </div>

      <div className='overflow-x-auto rounded-xl border border-border bg-card shadow-sm'>
        <table className='w-full text-left'>
          <thead>
            <tr className='border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              <th className='px-4 py-3'>Image</th>
              {optionNames.map((name) => (
                <th key={name} className='px-4 py-3'>
                  {name}
                </th>
              ))}
              <th className='px-4 py-3'>SKU</th>
              <th className='px-4 py-3'>Price</th>
              <th className='px-4 py-3'>Stock</th>
              <th className='px-4 py-3' />
            </tr>
          </thead>
          <tbody>
            {variants.length === 0 && (
              <tr>
                <td
                  colSpan={optionNames.length + 5}
                  className='px-4 py-10 text-center text-sm text-muted-foreground'
                >
                  No variants yet. Add one to start selling this product.
                </td>
              </tr>
            )}
            {variants.map((variant) => (
              <tr
                key={variant.id}
                className='border-b border-border last:border-0 hover:bg-accent/40'
              >
                <td className='px-4 py-3'>
                  <span className='grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-secondary text-secondary-foreground'>
                    {variant.thumbnail ? (
                      <img
                        src={variant.thumbnail}
                        alt=''
                        className='h-full w-full object-cover'
                      />
                    ) : (
                      <ImageIcon className='h-4 w-4' strokeWidth={1.75} />
                    )}
                  </span>
                </td>
                {optionNames.map((name) => (
                  <td key={name} className='px-4 py-3'>
                    <span className='text-sm font-medium text-foreground'>
                      {variant.options[name] || "—"}
                    </span>
                  </td>
                ))}
                <td className='px-4 py-3 text-sm text-muted-foreground'>
                  {variant.sku || "—"}
                </td>
                <td className='px-4 py-3 font-display text-sm font-semibold tabular-nums text-foreground'>
                  {price(variant.price)}
                </td>
                <td className='px-4 py-3'>
                  <StockBadge stock={variant.stock} />
                </td>
                <td className='px-4 py-3'>
                  <div className='flex justify-end'>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant='ghost'
                            className='p-2'
                            aria-label='Variant actions'
                          >
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem>
                          <Pencil className='h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem variant='destructive'>
                          <Trash2 className='h-4 w-4' />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

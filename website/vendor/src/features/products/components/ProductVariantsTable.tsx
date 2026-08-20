import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ImageIcon, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
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
import { CreateVariantModal } from "./CreateVariantModal";
import { UpdateVariantModal } from "./UpdateVariantModal";
import { DeleteVariantModal } from "./DeleteVariantModal";

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
  productId: string;
  optionNames: string[];
  variants: ProductVariant[];
}

export function ProductVariantsTable({
  productId,
  optionNames,
  variants,
}: ProductVariantsTableProps) {
  const navigate = useNavigate();
  // one modal for the whole table — unmounting it on close resets its state
  const [editing, setEditing] = useState<ProductVariant | null>(null);
  const [deleting, setDeleting] = useState<ProductVariant | null>(null);
  // the server refuses to leave a product with zero variants
  const canDelete = variants.length > 1;

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <p className='text-sm text-muted-foreground'>
          {variants.length} variant{variants.length === 1 ? "" : "s"} ·
          options: {optionNames.join(", ") || "—"}
        </p>
        <CreateVariantModal productId={productId} optionNames={optionNames} />
      </div>

      <div className='overflow-x-auto rounded-xl border border-border bg-card shadow-sm'>
        <table className='w-full text-left'>
          <thead>
            <tr className='border-b border-border text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              <th className='px-4 py-3'>Image</th>
              <th className='px-4 py-3'>Name</th>
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
                  colSpan={optionNames.length + 6}
                  className='px-4 py-10 text-center text-sm text-muted-foreground'
                >
                  No variants yet. Add one to start selling this product.
                </td>
              </tr>
            )}
            {variants.map((variant) => (
              <tr
                key={variant.id}
                className='cursor-pointer border-b border-border last:border-0 hover:bg-accent/40'
                onClick={() =>
                  navigate({
                    to: "/variants/$slug",
                    params: { slug: variant.slug },
                  })
                }
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
                <td className='px-4 py-3 text-sm font-medium text-foreground'>
                  {variant.name}
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
                <td className='px-4 py-3' onClick={(e) => e.stopPropagation()}>
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
                        <DropdownMenuItem onClick={() => setEditing(variant)}>
                          <Pencil className='h-4 w-4' />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant='destructive'
                          disabled={!canDelete}
                          onClick={() => setDeleting(variant)}
                        >
                          <Trash2 className='h-4 w-4' />
                          {canDelete ? "Delete" : "Last variant"}
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

      {editing && (
        <UpdateVariantModal
          productId={productId}
          variant={editing}
          optionNames={optionNames}
          open
          onOpenChange={(next) => !next && setEditing(null)}
        />
      )}

      {deleting && (
        <DeleteVariantModal
          productId={productId}
          variant={deleting}
          open
          onOpenChange={(next) => !next && setDeleting(null)}
        />
      )}
    </div>
  );
}

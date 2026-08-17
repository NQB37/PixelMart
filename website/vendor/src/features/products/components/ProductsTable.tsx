import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Archive,
  ArchiveRestore,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@website/shared/ui";
import { STATUS_BADGE, type Product } from "../types/product";
import { useGetAllBrands, useGetAllCategories } from "../hooks/useCatalog";
import { DeleteProductModal } from "./DeleteProductModal";
import { RestoreProductModal } from "./RestoreProductModal";

const columnHelper = createColumnHelper<Product>();

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
}

export function ProductsTable({ products, isLoading }: ProductsTableProps) {
  const navigate = useNavigate();
  // one modal for the whole table — unmounting it on close resets the confirm box
  const [deleting, setDeleting] = useState<{
    product: Product;
    permanent: boolean;
  } | null>(null);
  const [restoring, setRestoring] = useState<Product | null>(null);
  const { data: brands = [] } = useGetAllBrands();
  const { data: categories = [] } = useGetAllCategories();
  const brandItems = brands.map((b) => ({ value: b.id, label: b.name }));
  const categoryItems = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const columns = [
    columnHelper.accessor("name", {
      header: "Product",
      cell: ({ getValue }) => (
        <span className='truncate text-sm font-medium text-foreground'>
          {getValue()}
        </span>
      ),
    }),
    columnHelper.accessor("categoryId", {
      header: "Category",
      cell: ({ getValue }) => (
        <span className='text-sm text-foreground/80'>
          {(getValue() ?? [])
            .map((id) => categoryItems.find((c) => c.value === id)?.label)
            .filter(Boolean)
            .join(", ") || "—"}
        </span>
      ),
    }),
    columnHelper.accessor("brandId", {
      header: "Brand",
      cell: ({ getValue }) => (
        <span className='text-sm text-foreground/80'>
          {brandItems.find((b) => b.value === getValue())?.label || "—"}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => {
        const { label, className } = STATUS_BADGE[getValue()];
        return <Badge className={className}>{label}</Badge>;
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className='flex justify-end'>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant='ghost'
                    className='p-2'
                    aria-label='Product actions'
                  >
                    <MoreHorizontal className='h-4 w-4' />
                  </Button>
                }
              />
              <DropdownMenuContent align='end'>
                {/* an archived product can only be restored or wiped for good */}
                {product.deletedAt ? (
                  <DropdownMenuItem onClick={() => setRestoring(product)}>
                    <ArchiveRestore className='h-4 w-4' />
                    Restore
                  </DropdownMenuItem>
                ) : (
                  <>
                    <DropdownMenuItem
                      onClick={() =>
                        navigate({
                          to: "/products/$productId/edit",
                          params: { productId: product.id },
                        })
                      }
                    >
                      <Pencil className='h-4 w-4' />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant='destructive'
                      onClick={() => setDeleting({ product, permanent: false })}
                    >
                      <Archive className='h-4 w-4' />
                      Archive
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant='destructive'
                  onClick={() => setDeleting({ product, permanent: true })}
                >
                  <Trash2 className='h-4 w-4' />
                  Delete permanently
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    }),
  ];

  const table = useReactTable({
    data: products,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <table className='w-full text-left'>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className='border-b border-border'>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  className='px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {!isLoading && products.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className='px-4 py-10 text-center text-sm text-muted-foreground'
              >
                No products found.
              </td>
            </tr>
          )}
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className='cursor-pointer border-b border-border last:border-0 hover:bg-accent/40'
              onClick={() =>
                navigate({
                  to: "/products/$productId",
                  params: { productId: row.original.id },
                })
              }
            >
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className='px-4 py-3'
                  onClick={
                    cell.column.id === "actions"
                      ? (e) => e.stopPropagation()
                      : undefined
                  }
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {deleting && (
        <DeleteProductModal
          product={deleting.product}
          permanent={deleting.permanent}
          open
          onOpenChange={(next) => !next && setDeleting(null)}
        />
      )}

      {restoring && (
        <RestoreProductModal
          product={restoring}
          open
          onOpenChange={(next) => !next && setRestoring(null)}
        />
      )}
    </>
  );
}

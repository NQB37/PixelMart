import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ImageIcon, Pencil, Power, Trash2 } from "lucide-react";
import { Badge, Button, cn } from "@website/shared/ui";
import type { ProductStatus, VendorProduct } from "../types/product";

const STATUS_BADGE: Record<ProductStatus, { label: string; className: string }> = {
  ACTIVE: { label: "Active", className: "bg-success text-white" },
  DRAFT: { label: "Draft", className: "bg-secondary text-secondary-foreground" },
  OUT_OF_STOCK: { label: "Out of stock", className: "bg-warning text-foreground" },
  BANNED: { label: "Banned", className: "bg-destructive text-destructive-foreground" },
};

const columnHelper = createColumnHelper<VendorProduct>();

interface ProductsTableProps {
  products: VendorProduct[];
  isLoading: boolean;
  onEdit: (product: VendorProduct) => void;
  onDelete: (product: VendorProduct) => void;
  onToggleStatus: (product: VendorProduct) => void;
}

export function ProductsTable({
  products,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductsTableProps) {
  const columns = [
    columnHelper.display({
      id: "product",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className='flex items-center gap-3'>
            <span className='grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-md border border-border bg-secondary text-secondary-foreground'>
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt=''
                  className='h-full w-full object-cover'
                />
              ) : (
                <ImageIcon className='h-4 w-4' strokeWidth={1.75} />
              )}
            </span>
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium text-foreground'>
                {product.name}
              </p>
              <p className='truncate text-xs text-muted-foreground'>
                SKU: {product.sku || "—"}
              </p>
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: ({ getValue }) => (
        <span className='text-sm text-foreground/80'>{getValue() || "—"}</span>
      ),
    }),
    columnHelper.accessor("brand", {
      header: "Brand",
      cell: ({ getValue }) => (
        <span className='text-sm text-foreground/80'>{getValue() || "—"}</span>
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
        const isActive = product.status === "ACTIVE";
        return (
          <div className='flex justify-end gap-2'>
            <Button
              variant='ghost'
              className='p-2'
              onClick={() => onEdit(product)}
              title='Edit product'
              aria-label='Edit product'
            >
              <Pencil className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              className={cn(
                "p-2",
                isActive
                  ? "text-warning hover:bg-warning/10"
                  : "text-success hover:bg-success/10",
              )}
              onClick={() => onToggleStatus(product)}
              title={isActive ? "Deactivate product" : "Activate product"}
              aria-label={isActive ? "Deactivate product" : "Activate product"}
            >
              <Power className='h-4 w-4' />
            </Button>
            <Button
              variant='ghost'
              className='p-2 text-destructive hover:bg-destructive/10'
              onClick={() => onDelete(product)}
              title='Delete product'
              aria-label='Delete product'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
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
    <table className='w-full text-left'>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className='border-b border-border'>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                className='px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
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
            className='border-b border-border last:border-0 hover:bg-accent/40'
          >
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id} className='px-4 py-3'>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@website/shared/ui";
import type { AdminProduct } from "../types/product";

const columnHelper = createColumnHelper<AdminProduct>();

interface ProductsTableProps {
  products: AdminProduct[];
  isLoading: boolean;
}

export function ProductsTable({ products, isLoading }: ProductsTableProps) {
  const navigate = useNavigate();

  const columns = [
    columnHelper.display({
      id: "product",
      header: "Product",
      cell: ({ row }) => {
        const product = row.original;
        return (
          <div className='flex items-center gap-3'>
            <span className='grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary text-sm font-semibold text-secondary-foreground'>
              {product.thumbnail ? (
                <img
                  src={product.thumbnail}
                  alt=''
                  className='h-full w-full object-cover'
                />
              ) : (
                product.name.charAt(0).toUpperCase()
              )}
            </span>
            <p className='truncate text-sm font-medium text-foreground'>
              {product.name}
            </p>
          </div>
        );
      },
    }),
    columnHelper.accessor("vendor.vendorName", {
      header: "Vendor",
      cell: ({ getValue }) => (
        <span className='text-sm text-foreground'>{getValue()}</span>
      ),
    }),
    columnHelper.accessor("sku", {
      header: "SKU",
      cell: ({ getValue }) => (
        <span className='text-sm text-muted-foreground'>
          {getValue() || "—"}
        </span>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Submitted",
      cell: ({ getValue }) => (
        <span className='text-sm text-muted-foreground'>
          {new Date(getValue()).toLocaleDateString()}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <Button
          variant='ghost'
          className='px-3 py-1.5 text-xs'
          onClick={() =>
            navigate({
              to: "/catalog/review-queue/$productId",
              params: { productId: row.original.id },
            })
          }
        >
          Review
        </Button>
      ),
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
              No products waiting for review.
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

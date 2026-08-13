import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { MoreHorizontal, Pencil, Power, Trash2 } from "lucide-react";
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

const columnHelper = createColumnHelper<Product>();

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onToggleStatus: (product: Product) => void;
}

export function ProductsTable({
  products,
  isLoading,
  onEdit,
  onDelete,
  onToggleStatus,
}: ProductsTableProps) {
  const navigate = useNavigate();
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
          {getValue()
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
        const isActive = product.status === "ACTIVE";
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
                <DropdownMenuItem onClick={() => onEdit(product)}>
                  <Pencil className='h-4 w-4' />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggleStatus(product)}>
                  <Power className='h-4 w-4' />
                  {isActive ? "Deactivate" : "Activate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant='destructive'
                  onClick={() => onDelete(product)}
                >
                  <Trash2 className='h-4 w-4' />
                  Delete
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
                // the actions menu lives inside the row — don't navigate from it
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
  );
}

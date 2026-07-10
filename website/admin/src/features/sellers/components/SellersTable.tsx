import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useNavigate } from "@tanstack/react-router";
import { Badge, PixelButton } from "@website/shared/ui";
import type { AdminShop } from "../types/shop";

const STATUS_BADGE_VARIANT: Record<
  AdminShop["status"],
  "success" | "warning" | "secondary"
> = {
  ACTIVE: "success",
  SUSPENDED: "warning",
  INACTIVE: "secondary",
};

const columnHelper = createColumnHelper<AdminShop>();

interface SellersTableProps {
  shops: AdminShop[];
  isLoading: boolean;
}

export function SellersTable({ shops, isLoading }: SellersTableProps) {
  const navigate = useNavigate();

  const columns = [
    columnHelper.display({
      id: "shop",
      header: "Shop",
      cell: ({ row }) => {
        const shop = row.original;
        return (
          <div className='flex items-center gap-3'>
            <span className='grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-semibold text-secondary-foreground'>
              {shop.logoUrl ? (
                <img
                  src={shop.logoUrl}
                  alt=''
                  className='h-full w-full object-cover'
                />
              ) : (
                shop.shopName.charAt(0).toUpperCase()
              )}
            </span>
            <p className='truncate text-sm font-medium text-foreground'>
              {shop.shopName}
            </p>
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "owner",
      header: "Owner",
      cell: ({ row }) => (
        <div className='min-w-0'>
          <p className='truncate text-sm text-foreground'>
            {row.original.ownerFullName || "—"}
          </p>
          <p className='truncate text-xs text-muted-foreground'>
            {row.original.ownerEmail}
          </p>
        </div>
      ),
    }),
    columnHelper.accessor("rating", {
      header: "Rating",
      cell: ({ getValue }) => (
        <span className='text-sm text-muted-foreground'>
          {getValue().toFixed(1)}
        </span>
      ),
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: ({ getValue }) => (
        <Badge variant={STATUS_BADGE_VARIANT[getValue()]}>{getValue()}</Badge>
      ),
    }),
    columnHelper.accessor("createdAt", {
      header: "Joined",
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
        <PixelButton
          variant='ghost'
          className='px-3 py-1.5 text-xs'
          onClick={() =>
            navigate({
              to: "/users/sellers/$shopId",
              params: { shopId: row.original.id },
            })
          }
        >
          View
        </PixelButton>
      ),
    }),
  ];

  const table = useReactTable({
    data: shops,
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
        {!isLoading && shops.length === 0 && (
          <tr>
            <td
              colSpan={columns.length}
              className='px-4 py-10 text-center text-sm text-muted-foreground'
            >
              No shops found.
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

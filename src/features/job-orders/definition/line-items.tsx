import type { JobOrderLineItemDto } from "@/api/models";
import format from "@/lib/format-money";
import { type ColumnDef } from "@tanstack/react-table";

export type LineItem = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  lineItem: JobOrderLineItemDto;
};

export const columns: ColumnDef<LineItem>[] = [
  {
    accessorKey: "name",
    header: "Item",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-sm text-muted-foreground">
            {row.original.description}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "price",
    header: () => <div className="text-right">Unit Price</div>,
    cell: ({ row }) => (
      <div className="text-right">{format(row.original.price)}</div>
    ),
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-right">Quantity</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.quantity}</div>
    ),
  },
  {
    id: "total",
    header: () => <div className="text-right">Total</div>,
    cell: ({ row }) => (
      <div className="text-right">
        {format(row.original.price * row.original.quantity)}
      </div>
    ),
  },
];

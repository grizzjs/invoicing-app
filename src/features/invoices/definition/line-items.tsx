import format from "@/lib/format-money";
import { type ColumnDef } from "@tanstack/react-table";

export type DeliveryReceipts = {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
};

export const columns: ColumnDef<DeliveryReceipts>[] = [
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
    accessorKey: "quantity",
    header: () => <div className="text-right">Quantity</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.quantity}</div>
    ),
  },
  {
    accessorKey: "unitPrice",
    header: () => <div className="text-right">Unit Price</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.unitPrice}</div>
    ),
  },
  {
    accessorKey: "Amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right">{format(row.original.amount)}</div>
    ),
  },
];

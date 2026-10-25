import { type ColumnDef } from "@tanstack/react-table";

export type DeliveryReceipts = {
  name: string;
  description: string;
  delivered: number;
  ordered: number;
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
    accessorKey: "ordered",
    header: () => <div className="text-right">Ordered Quantity</div>,
    cell: ({ row }) => <div className="text-right">{row.original.ordered}</div>,
  },
  {
    accessorKey: "delivered",
    header: () => <div className="text-right">Delivered Quantity</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.delivered}</div>
    ),
  },
];

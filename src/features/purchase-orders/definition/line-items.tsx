import type { PurchaseOrderLineItemDto } from "@/api/models";
import { Progress } from "@/components/ui/progress";
import { Status, StatusLabel } from "@/components/ui/status";
import { type ColumnDef } from "@tanstack/react-table";
import { LineItemSheet } from "../components/line-item-sheet";

export type LineItem = {
  name: string;
  description: string;
  price: number;
  quantity: number;
  progress: number;
  lineItem: PurchaseOrderLineItemDto;
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
    cell: ({ row }) => <div className="text-right">{row.original.price}</div>,
  },
  {
    accessorKey: "quantity",
    header: () => <div className="text-right">Quantiy Ordered</div>,
    cell: ({ row }) => (
      <div className="text-right">{row.original.quantity}</div>
    ),
  },
  {
    accessorKey: "progress",
    header: "Delivery Progress",
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-2">
          <Progress value={row.original.progress} className="w-full max-w-md" />{" "}
          <Status variant={row.original.progress < 80 ? "warning" : "success"}>
            <StatusLabel>{row.original.progress.toFixed()}%</StatusLabel>
          </Status>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <LineItemSheet lineItem={row.original.lineItem} />;
    },
  },
];

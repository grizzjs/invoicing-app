import { Badge } from "@/features/common/components/badge";
import entityToBadge from "@/features/invoices/lib/entity-to-badge";
import format from "@/lib/format-money";
import { type ColumnDef } from "@tanstack/react-table";

export type LineItemDelivery = {
  id: number;
  status: "Paid" | "Unpaid" | "Overdue";
  totalCost: number;
  dueInDays: number;
  createDate: string;
};

export const columns: ColumnDef<LineItemDelivery>[] = [
  {
    accessorKey: "id",
    header: "Invoice No.",
  },
  {
    header: "Status",
    accessorKey: "status",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => {
      const { variant, status } = entityToBadge(row.original);
      return <Badge variant={variant} text={status} />;
    },
  },
  {
    accessorKey: "totalCost",
    header: "Total Cost",
    cell: ({ row }) => {
      return <>{format(row.original.totalCost)}</>;
    },
  },
];

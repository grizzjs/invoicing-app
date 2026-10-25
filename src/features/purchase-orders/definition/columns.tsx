import { Button } from "@/components/ui/button";
import { Badge } from "@/features/common/components/badge";
import format from "@/lib/format-money";
import { parseDateFromFormat } from "@/lib/parse-date";
import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import entityToBadge from "../lib/entity-to-badge";

export type PurchaseOrder = {
  id: number;
  customer: string;
  createDate: string;
  totalCost: number;
  status:
    | "Draft"
    | "Finalized"
    | "Approved"
    | "Cancelled"
    | "Pending"
    | "Completed";
};

export const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "id",
    header: "Number",
    cell: ({ row }) => {
      const name = row.original.id;
      return (
        <Link
          to="/purchase-orders/$purchaseOrderId"
          // @ts-expect-error -- idk why getting error but works
          params={{ purchaseOrderId: String(row.original.id) }}
        >
          {name}
        </Link>
      );
    },
  },
  {
    accessorKey: "createDate",
    header: "Date Created",
    filterFn: (row, columnId, filterValue) => {
      const [start, end] = filterValue;
      const value = parseDateFromFormat("MMM d, yyyy", row.getValue(columnId));
      return value >= start && value <= end;
    },
    meta: {
      label: "Date",
      variant: "dateRange",
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "totalCost",
    header: () => {
      return <div className="text-right">Total Cost</div>;
    },
    cell: ({ row }) => {
      return <div className="text-right">{format(row.original.totalCost)}</div>;
    },
  },
  {
    header: "Status",
    accessorKey: "status",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => {
      const { variant, status } = entityToBadge(row.original);
      return <Badge variant={variant} text={status} />;
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Draft", value: "Draft" },
        { label: "Finalized", value: "Finalized" },
        { label: "Approved", value: "Approved" },
        { label: "Cancelled", value: "Cancelled" },
        { label: "Pending", value: "Pending" },
        { label: "Completed", value: "Completed" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    id: "actions",
    cell: () => {
      return (
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Pencil size={15} />
        </Button>
      );
    },
  },
];

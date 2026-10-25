import { Badge } from "@/features/common/components/badge";
import { parseDateFromFormat } from "@/lib/parse-date";
import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import entityToBadge from "../lib/entity-to-badge";

export type DeliveryReceipts = {
  id: number;
  customer: string;
  createDate: string;
  purchaseOrderId: number;
  status: "New" | "Shipped" | "Delivered" | "Paid";
};

export const columns: ColumnDef<DeliveryReceipts>[] = [
  {
    accessorKey: "id",
    header: "Number",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link
          to="/deliveries/$deliveryId"
          // @ts-expect-error -- idk why getting error but works
          params={{ deliveryId: `${id}` }}
        >
          {id}
        </Link>
      );
    },
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.getValue(columnId));
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
    accessorKey: "purchaseOrderId",
    header: "PO Number",
  },
  {
    header: "Status",
    accessorKey: "status",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => {
      const { variant, status } = entityToBadge({
        status: row.original.status,
      });
      return <Badge variant={variant} text={status} />;
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "New", value: "New" },
        { label: "Shipped", value: "Shipped" },
        { label: "Delivered", value: "Delivered" },
        { label: "Paid", value: "Paid" },
      ],
    },
    enableColumnFilter: true,
  },
];

import { Status, StatusLabel } from "@/components/ui/status";
import format from "@/lib/format-money";
import { parseDateFromFormat } from "@/lib/parse-date";
import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

export type Invoice = {
  id: number;
  customer: string;
  createDate: string;
  totalCost: number;
  status: "Unpaid" | "Paid" | "Overdue";
};

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "id",
    header: "Number",
    filterFn: (row, columnId, filterValue) => {
      return filterValue.includes(row.getValue(columnId));
    },
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link
          to="/invoices/$invoiceId"
          // @ts-expect-error -- idk why getting error but works
          params={{ invoiceId: `${id}` }}
        >
          {id}
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
    header: "Status",
    accessorKey: "status",
    filterFn: "arrIncludesSome",
    cell: ({ row }) => {
      let variant: "info" | "error" | "success";
      switch (row.original.status) {
        case "Overdue":
          variant = "error";
          break;
        case "Paid":
          variant = "success";
          break;
        default:
          variant = "info";
      }
      return (
        <Status variant={variant}>
          <StatusLabel>{row.original.status}</StatusLabel>
        </Status>
      );
    },
    meta: {
      label: "Status",
      variant: "multiSelect",
      options: [
        { label: "Unpaid", value: "Unpaid" },
        { label: "Overdue", value: "Overdue" },
        { label: "Paid", value: "Paid" },
      ],
    },
    enableColumnFilter: true,
  },
  {
    accessorKey: "totalCost",
    header: () => <div className="text-right">Total Cost</div>,
    cell: ({ row }) => (
      <div className="text-right">{format(row.original.totalCost)}</div>
    ),
  },
];

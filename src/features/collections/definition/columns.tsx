import format from "@/lib/format-money";
import { parseDateFromFormat } from "@/lib/parse-date";
import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

export type Collection = {
  id: number;
  customer: string;
  createDate: string;
  amount: number;
  notes: string;
  vat: number;
};

export const columns: ColumnDef<Collection>[] = [
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
          to="/collections/$collectionId"
          // @ts-expect-error -- idk why getting error but works
          params={{ collectionId: `${id}` }}
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
    accessorKey: "notes",
    header: "Notes",
  },
  {
    accessorKey: "Amount",
    header: () => <div className="text-right">Amount Collected</div>,
    cell: ({ row }) => (
      <div className="text-right">{format(row.original.amount)}</div>
    ),
  },
];

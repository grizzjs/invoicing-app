import format from "@/lib/format-money";
import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

export type Invoice = {
  createDate: string;
  id: number;
  amount: number;
};

export const columns: ColumnDef<Invoice>[] = [
  {
    accessorKey: "createDate",
    header: "Date Created",
  },
  {
    accessorKey: "id",
    header: "Invoice Number",
    cell: ({ row }) => {
      return (
        <Link to={`/invoices/${row.original.id}`} className="text-right">
          {row.original.id}
        </Link>
      );
    },
  },
  {
    accessorKey: "charge",
    header: () => {
      return <div className="text-right">Charge</div>;
    },
    cell: ({ row }) => {
      return <div className="text-right">{format(row.original.amount)}</div>;
    },
  },
];

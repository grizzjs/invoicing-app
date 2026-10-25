import type { InvoiceDto } from "@/api/models";
import { formatDate } from "@/lib/format-date";
import format from "@/lib/format-money";
import { parseDateFromISO } from "@/lib/parse-date";
import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<InvoiceDto>[] = [
  {
    accessorKey: "id",
    header: "Invoice Number",
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
    cell: ({ row }) => (
      <div>
        {formatDate(parseDateFromISO(row.original.createDate).toJSDate())}
      </div>
    ),
  },
  {
    accessorKey: "dueInDays",
    header: "Payment Terms",
    cell: ({ row }) => <div>{row.original.dueInDays} days</div>,
  },
  {
    header: "Due Date",
    cell: ({ row }) => (
      <div>
        {formatDate(
          parseDateFromISO(row.original.createDate)
            .plus({
              days: row.original.dueInDays,
            })
            .toJSDate(),
        )}
      </div>
    ),
  },
  {
    header: "Official Receipt Number",
    cell: ({ row }) => <div>{row.original.officialReceipt}</div>,
  },
  {
    accessorKey: "Amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => (
      <div className="text-right">{format(row.original.amount)}</div>
    ),
  },
];

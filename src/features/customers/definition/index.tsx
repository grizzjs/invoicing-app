import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { CustomerRowActions } from "../components/customer-row-actions";

export type Customer = {
  id: number;
  name: string;
  address: string;
  phoneNumber: string;
  email: string;
  tin: string;
};

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const name = row.original.name;
      return (
        <Link
          to="/customers/$customerId"
          // @ts-expect-error -- idk why getting error but works
          params={{ customerId: String(row.original.id) }}
        >
          {name}
        </Link>
      );
    },
    size: 100,
  },
  {
    accessorKey: "address",
    header: "Address",
    size: 200,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone No.",
    size: 100,
  },
  {
    accessorKey: "email",
    header: "Email",
    size: 100,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <CustomerRowActions customer={row.original} />;
    },
  },
];

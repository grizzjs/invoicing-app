import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";
import { Pencil, Printer } from "lucide-react";

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
    cell: () => {
      return (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Printer size={15} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil size={15} />
          </Button>
        </div>
      );
    },
  },
];

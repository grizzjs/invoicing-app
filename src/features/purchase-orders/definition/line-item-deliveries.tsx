import { Badge } from "@/features/common/components/badge";
import entityToBadge from "@/features/deliveries/lib/entity-to-badge";
import { Link } from "@tanstack/react-router";
import { type ColumnDef } from "@tanstack/react-table";

export type LineItemDelivery = {
  id: number;
  status: "New" | "Shipped" | "Delivered" | "Paid";
  quantity: number;
};

export const columns: ColumnDef<LineItemDelivery>[] = [
  {
    accessorKey: "id",
    header: "Delivery No.",
    cell: ({ row }) => (
      <Link to={`/deliveries/${row.original.id}`} className="underline">
        {row.original.id}
      </Link>
    ),
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
    accessorKey: "quantity",
    header: "Quantity",
  },
];

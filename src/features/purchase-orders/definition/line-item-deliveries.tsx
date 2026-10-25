import { Badge } from "@/features/common/components/badge";
import entityToBadge from "@/features/deliveries/lib/entity-to-badge";
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

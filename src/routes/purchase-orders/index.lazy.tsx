import ListPurchaseOrdersPage from "@/features/purchase-orders/pages/list-purchase-orders";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/purchase-orders/")({
  component: ListPurchaseOrdersPage,
});

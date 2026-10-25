import CreatePurchaseOrderPage from "@/features/purchase-orders/pages/create-purchase-order";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/purchase-orders/new")({
  component: CreatePurchaseOrderPage,
});

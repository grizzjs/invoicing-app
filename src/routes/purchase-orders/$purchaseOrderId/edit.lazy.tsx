import EditPurchaseOrderPage from "@/features/purchase-orders/pages/edit-purchase-order";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/purchase-orders/$purchaseOrderId/edit",
)({
  component: EditPurchaseOrderPage,
});

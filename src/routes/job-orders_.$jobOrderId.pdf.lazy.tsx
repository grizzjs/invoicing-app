import ViewJobOrderPDF from "@/features/job-orders/pages/view-job-order-pdf";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/job-orders_/$jobOrderId/pdf")({
  component: ViewJobOrderPDF,
});

import ViewJobOrderPage from "@/features/job-orders/pages/view-job-order";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/job-orders/$jobOrderId/")({
  component: ViewJobOrderPage,
});

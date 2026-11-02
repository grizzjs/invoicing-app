import EditJobOrderPage from "@/features/job-orders/pages/edit-job-order";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/job-orders/$jobOrderId/edit")({
  component: EditJobOrderPage,
});

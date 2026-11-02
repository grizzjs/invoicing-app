import ListJobOrdersPage from "@/features/job-orders/pages/list-job-orders";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/job-orders/")({
  component: ListJobOrdersPage,
});

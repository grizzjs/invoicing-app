import CreateJobOrderPage from "@/features/job-orders/pages/create-job-order";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/job-orders/new")({
  component: CreateJobOrderPage,
});

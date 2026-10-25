import ListDeliveriesPage from "@/features/deliveries/pages/list-deliveries";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/deliveries/")({
  component: ListDeliveriesPage,
});

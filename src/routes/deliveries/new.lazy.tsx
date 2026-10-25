import CreateDeliveryPage from "@/features/deliveries/pages/create-delivery";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/deliveries/new")({
  component: CreateDeliveryPage,
});

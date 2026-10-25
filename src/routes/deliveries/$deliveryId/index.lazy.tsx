import ViewDeliveryPage from "@/features/deliveries/pages/view-delivery";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/deliveries/$deliveryId/")({
  component: ViewDeliveryPage,
});

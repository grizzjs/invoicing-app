import EditDeliveryPage from "@/features/deliveries/pages/edit-delivery";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/deliveries/$deliveryId/edit")({
  component: EditDeliveryPage,
});

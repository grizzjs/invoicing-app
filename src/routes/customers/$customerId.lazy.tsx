import ViewCustomerPage from "@/features/customers/pages/view-customer";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/customers/$customerId")({
  component: ViewCustomerPage,
});

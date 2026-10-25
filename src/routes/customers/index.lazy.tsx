import ListCustomersPage from "@/features/customers/pages/list-customers";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/customers/")({
  component: ListCustomersPage,
});

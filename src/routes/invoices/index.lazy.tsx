import ListInvoicesPage from "@/features/invoices/pages/list-invoices";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/invoices/")({
  component: ListInvoicesPage,
});

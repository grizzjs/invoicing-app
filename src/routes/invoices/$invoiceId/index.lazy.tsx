import ViewInvoicesPage from "@/features/invoices/pages/view-invoices";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/invoices/$invoiceId/")({
  component: ViewInvoicesPage,
});

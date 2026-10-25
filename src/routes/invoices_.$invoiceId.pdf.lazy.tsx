import ViewInvoicePDF from "@/features/invoices/pages/view-invoice-pdf";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/invoices_/$invoiceId/pdf")({
  component: ViewInvoicePDF,
});

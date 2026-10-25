import ViewOfficialReceiptPDF from "@/features/invoices/pages/view-official-receipt-pdf";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/invoices_/$invoiceId/official-receipt",
)({
  component: ViewOfficialReceiptPDF,
});

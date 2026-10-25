import ViewStatementPDF from "@/features/customers/pages/view-statement-pdf";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/customers_/$customerId/statements/$period",
)({
  component: ViewStatementPDF,
});

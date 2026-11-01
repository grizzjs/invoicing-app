import ViewCollectionPDF from "@/features/collections/pages/view-collection-pdf";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/collections_/$collectionId/pdf")({
  component: ViewCollectionPDF,
});

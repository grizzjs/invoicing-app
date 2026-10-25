import ViewCollectionPage from "@/features/collections/pages/view-collection";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/collections/$collectionId")({
  component: ViewCollectionPage,
});

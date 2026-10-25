import CreateCollectionPage from "@/features/collections/pages/create-collection";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/collections/new")({
  component: CreateCollectionPage,
});

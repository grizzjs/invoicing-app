import ListCollectionsPage from "@/features/collections/pages/list-collections";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/collections/")({
  component: ListCollectionsPage,
});

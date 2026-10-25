import CollectionsPage from "@/features/collections/pages";
import { Sidebar } from "@/features/common/pages/Sidebar";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/collections")({
  component: () => (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <CollectionsPage />
      </div>
    </div>
  ),
});

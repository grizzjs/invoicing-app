import { Sidebar } from "@/features/common/pages/Sidebar";
import JobOrdersPage from "@/features/job-orders/pages";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/job-orders")({
  component: () => (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <JobOrdersPage />
      </div>
    </div>
  ),
});

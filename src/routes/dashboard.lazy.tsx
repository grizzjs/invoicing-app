import { Sidebar } from "@/features/common/pages/Sidebar";
import DashboardPage from "@/features/dashboard/pages/dashboard";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/dashboard")({
  component: () => (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardPage />
      </div>
    </div>
  ),
});

import { Sidebar } from "@/features/common/pages/Sidebar";
import CustomersPage from "@/features/customers/pages";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/customers")({
  component: () => (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <CustomersPage />
      </div>
    </div>
  ),
});

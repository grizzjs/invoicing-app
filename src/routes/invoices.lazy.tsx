import { Sidebar } from "@/features/common/pages/Sidebar";
import InvoicesPage from "@/features/invoices/pages";
import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/invoices")({
  component: () => (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <InvoicesPage />
      </div>
    </div>
  ),
});

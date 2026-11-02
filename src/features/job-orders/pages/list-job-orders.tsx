import { useGetJobOrders } from "@/api/endpoints/job-orders/job-orders";
import type { JobOrderDto } from "@/api/models";
import { DataTable } from "@/components/ui/data-table/data-table";
import { Header } from "@/components/ui/header";
import { StatCard } from "@/components/ui/stat-card";
import { formatDateFromISO } from "@/lib/format-date";
import { countBy } from "ramda";
import { HeaderActionsGroup } from "../components/list-header-actions-group";
import { columns } from "../definition/columns";

export default function ListJobOrdersPage() {
  const { data: jobOrders = [], isLoading } = useGetJobOrders(
    {},
    { query: { staleTime: 5 * 60 * 1000 } },
  );

  if (isLoading) return <p>Loading...</p>;

  const formattedJobOrders = jobOrders.map((jo) => ({
    id: jo.id,
    status: jo.status,
    createDate: formatDateFromISO(jo.createDate),
    customer: jo.customer?.name ?? "",
    totalCost: (jo.lineItems ?? []).reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    ),
  }));

  const statesCount = {
    Draft: 0,
    Finalized: 0,
    Approved: 0,
    Pending: 0,
    ...countBy((p: JobOrderDto) => p.status)(jobOrders),
  };

  const initialState = {
    id: "status",
    value: ["Draft", "Finalized", "Approved", "Pending"],
  };

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      {/* Header */}
      <Header title="Job Orders">
        <HeaderActionsGroup />
      </Header>

      <div className="flex flex-col pt-6 pr-6 pb-10 pl-6 gap-10">
        <div className="grid grid-cols-5 gap-6">
          <StatCard
            label="Total Open Orders"
            value={
              statesCount["Draft"] +
              statesCount["Finalized"] +
              statesCount["Approved"] +
              statesCount["Pending"]
            }
          />
          <StatCard label="New Orders" value={statesCount["Draft"]} />
          <StatCard label="Processing" value={statesCount["Finalized"]} />
          <StatCard label="Approved" value={statesCount["Approved"]} />
          <StatCard label="Pending" value={statesCount["Pending"]} />
        </div>
        <DataTable
          columns={columns}
          data={formattedJobOrders}
          enableSearch={true}
          initialState={initialState}
          defaultSorting={[{ id: "id", desc: true }]}
        />
      </div>
    </main>
  );
}

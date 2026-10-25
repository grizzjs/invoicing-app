import { useGetPurchaseOrders } from "@/api/endpoints/purchase-orders/purchase-orders";
import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "../definition/columns";

import { formatDateFromISO } from "@/lib/format-date";

import type { PurchaseOrderDto } from "@/api/models";
import { Header } from "@/components/ui/header";
import { StatCard } from "@/components/ui/stat-card";
import { countBy } from "ramda";
import { HeaderActionsGroup } from "../components/list-header-actions-group";

export default function ListPurchaseOrdersPage() {
  const { data: purchaseOrders, isLoading } = useGetPurchaseOrders(
    {},
    { query: { staleTime: 5 * 60 * 1000 } },
  );

  if (isLoading) return <p>Loading...</p>;

  const formattedPurchaseOrders = purchaseOrders.map((po) => ({
    id: po.id,
    status: po.status,
    createDate: formatDateFromISO(po.createDate),
    customer: po.customer.name,
    totalCost: po.lineItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0,
    ),
  }));

  const statesCount = {
    Draft: 0,
    Finalized: 0,
    Approved: 0,
    Pending: 0,
    ...countBy((p: PurchaseOrderDto) => p.status)(purchaseOrders),
  };

  const initialState = {
    id: "status",
    value: ["Draft", "Finalized", "Approved", "Pending"],
  };

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      {/* Header */}

      <Header title="Purchase Orders">
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
          <StatCard label="New POs" value={statesCount["Draft"]} />
          <StatCard label="Processing" value={statesCount["Finalized"]} />
          <StatCard
            label="Ready for Delivery"
            value={statesCount["Approved"]}
          />
          <StatCard label="Ongoing Deliveries" value={statesCount["Pending"]} />
        </div>
        <DataTable
          columns={columns}
          data={formattedPurchaseOrders}
          enableSearch={true}
          initialState={initialState}
        />
      </div>
    </main>
  );
}

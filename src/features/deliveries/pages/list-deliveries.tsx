import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "../definition/columns";

import { useGetDeliveryReceipts } from "@/api/endpoints/delivery-receipts/delivery-receipts";
import type { DeliveryReceiptDto } from "@/api/models";
import { Header } from "@/components/ui/header";
import { StatCard } from "@/components/ui/stat-card";
import { formatDateFromISO } from "@/lib/format-date";
import { getRouteApi } from "@tanstack/react-router";
import { countBy } from "ramda";
import { HeaderActionsGroup } from "../components/list-header-actions-group";

const routeApi = getRouteApi("/deliveries");

export default function ListDeliveriesPage() {
  const { data: deliveryReceipts, isLoading } = useGetDeliveryReceipts(
    {},
    { query: { staleTime: 10000 } },
  );

  const { ids } = routeApi.useSearch();

  if (isLoading) return <p>Loading...</p>;

  const formattedPDeliveryReceipts = deliveryReceipts.map(
    ({ id, createDate, status, purchaseOrder }) => ({
      id,
      status,
      createDate: formatDateFromISO(createDate),
      customer: purchaseOrder.customer.name,
      purchaseOrderId: purchaseOrder.id,
    }),
  );

  const statesCount = {
    New: 0,
    Shipped: 0,
    ...countBy((p: DeliveryReceiptDto) => p.status)(deliveryReceipts),
  };

  let initialState = {
    id: "status",
    value: ["New", "Shipped"],
  };

  if (ids)
    initialState = {
      id: "id",
      value: ids,
    };

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      {/* Header */}

      <Header title="Deliveries">
        <HeaderActionsGroup />
      </Header>

      <div className="flex flex-col pt-6 pr-6 pb-10 pl-6 gap-10">
        <div className="grid grid-cols-3 gap-6">
          <StatCard
            label="Total Open Orders"
            value={statesCount["New"] + statesCount["Shipped"]}
          />
          <StatCard label="Pending Delivery" value={statesCount["New"]} />
          <StatCard label="In Transit" value={statesCount["Shipped"]} />
        </div>
        <DataTable
          columns={columns}
          data={formattedPDeliveryReceipts}
          enableSearch={true}
          initialState={initialState}
        />
      </div>
    </main>
  );
}

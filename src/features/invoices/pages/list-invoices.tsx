import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "../definition/columns";

import { useGetInvoices } from "@/api/endpoints/invoices/invoices";
import { Header } from "@/components/ui/header";
import { StatCard } from "@/components/ui/stat-card";
import { formatDateFromISO } from "@/lib/format-date";
import { getRouteApi } from "@tanstack/react-router";
import { countBy } from "ramda";
import { HeaderActionsGroup } from "../components/list-header-actions-group";
import { enrichStatus } from "../lib/classify-status";

const routeApi = getRouteApi("/invoices");

export default function ListInvoicesPage() {
  const { data: invoices, isLoading } = useGetInvoices(
    {},
    { query: { staleTime: 10000 } },
  );

  const { ids } = routeApi.useSearch();

  if (isLoading) return <p>Loading...</p>;

  const formattedInvoices = invoices.map(
    ({ id, status, createDate, dueInDays, customer, amount }) => ({
      id,
      status: enrichStatus(status, dueInDays, createDate),
      createDate: formatDateFromISO(createDate),
      customer: customer.name,
      totalCost: amount,
    }),
  );

  const statesCount = {
    Unpaid: 0,
    Overdue: 0,
    ...countBy((invoice) => invoice.status, formattedInvoices),
  };

  let initialState = {
    id: "status",
    value: ["Unpaid", "Overdue"],
  };

  if (ids)
    initialState = {
      id: "id",
      value: ids,
    };

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      {/* Header */}

      <Header title="Invoices">
        <HeaderActionsGroup />
      </Header>

      <div className="flex flex-col pt-6 pr-6 pb-10 pl-6 gap-10">
        <div className="grid grid-cols-3 gap-6">
          <StatCard
            label="Total Open Invoices"
            value={statesCount["Unpaid"] + statesCount["Overdue"]}
          />
          <StatCard label="Pending Payment" value={statesCount["Unpaid"]} />
          <StatCard label="Overdue" value={statesCount["Overdue"]} />
        </div>
        <DataTable
          columns={columns}
          data={formattedInvoices}
          enableSearch={true}
          initialState={initialState}
        />
      </div>
    </main>
  );
}

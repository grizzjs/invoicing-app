import { useGetCustomers } from "@/api/endpoints/customers/customers";
import { DataTable } from "@/components/ui/data-table/data-table";

import { HeaderActionsGroup } from "../components/header-actions-group";
import { columns } from "../definition";

export default function ListCustomersPage() {
  const { data: customers, isLoading } = useGetCustomers(
    {},
    { query: { staleTime: 10000 } },
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      {/* Header */}

      <div className="border-b border-#989898 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4 h-7">
          <h1 className="text-xl font-bold text-gray-900">Customers</h1>
          <HeaderActionsGroup />
        </div>
      </div>

      <div className="pt-6 pr-6 pb-10 pl-6 gap-10">
        <DataTable columns={columns} data={customers} enableSearch={true} />
      </div>
    </main>
  );
}

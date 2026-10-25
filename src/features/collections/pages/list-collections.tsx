import { DataTable } from "@/components/ui/data-table/data-table";
import { columns } from "../definition/columns";

import { useGetCollections } from "@/api/endpoints/collections/collections";
import { Header } from "@/components/ui/header";
import { formatDate } from "@/lib/format-date";
import { parseDateFromISO } from "@/lib/parse-date";
import { HeaderActionsGroup } from "../components/list-header-actions-group";

export default function ListCollectionsPage() {
  const { data: collections, isLoading } = useGetCollections(
    {},
    { query: { staleTime: 10000 } },
  );

  if (isLoading) return <p>Loading...</p>;

  const collectionTableRows = collections.map(
    ({ id, customer, createDate, amount, notes, vat }) => {
      return {
        id,
        customer: customer.name,
        createDate: formatDate(parseDateFromISO(createDate).toJSDate()),
        amount,
        notes,
        vat,
      };
    },
  );

  return (
    <main className="flex flex-1 flex-col overflow-auto">
      {/* Header */}

      <Header title="Collections">
        <HeaderActionsGroup />
      </Header>

      <div className="flex flex-col pt-6 pr-6 pb-10 pl-6 gap-10">
        <DataTable
          columns={columns}
          data={collectionTableRows}
          enableSearch={true}
        />
      </div>
    </main>
  );
}

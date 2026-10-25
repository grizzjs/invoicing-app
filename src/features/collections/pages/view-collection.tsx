import { useGetCollection } from "@/api/endpoints/collections/collections";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DetailProperty, DetailsCard } from "@/components/ui/details-card";
import { Header } from "@/components/ui/header";
import { Key } from "@/components/ui/key-pair/key";
import { Value } from "@/components/ui/key-pair/value";
import { ProgressSummary } from "@/components/ui/progress-summary";
import { CustomerCard } from "@/features/customers/components/customer-card.component";
import { formatDate } from "@/lib/format-date";
import format from "@/lib/format-money";
import { useParams } from "@tanstack/react-router";
import { HeaderActionsGroup } from "../components/header-actions-group";
import { columns } from "../definition/invoices";

export default function ViewCollectionPage() {
  const params = useParams({ from: "/collections/$collectionId" });
  const {
    data: collection,
    isLoading,
    isError,
  } = useGetCollection(params.collectionId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  const entity = {
    id: collection.id,
  };

  const subtotal = collection.amount / (1 - collection.vat / 100);

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Collections" entity={entity}>
        <HeaderActionsGroup />
      </Header>

      <div className="grid grid-cols-3 gap-3 px-6">
        <DetailsCard details="Details" className="col-span-2">
          <DetailProperty
            header="Date Created"
            value={formatDate(collection.createDate)}
          />

          <DetailProperty header="Attachment" value="3 Files" />
        </DetailsCard>
        <ProgressSummary title="Summary">
          <div>
            <p className="text-3xl font-medium text-foreground mb-0.5">
              {format(collection.amount)}
            </p>
            <p className="text-sm text-muted-foreground mb-5">
              Payment Collected
            </p>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            <Key>Subtotal</Key>
            <Value className="justify-self-end">{format(subtotal)}</Value>
            <Key>Vat Withheld</Key>
            <Value className="justify-self-end">
              {format(subtotal * (collection.vat / 100))}
            </Value>
          </div>
        </ProgressSummary>
        <CustomerCard customer={collection.customer} className="col-span-3" />
        <DataTable
          data={collection.invoices}
          columns={columns}
          enableSearch={true}
          className="col-span-3"
        />
      </div>
    </main>
  );
}

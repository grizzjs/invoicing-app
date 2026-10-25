import { useGetDeliveryReceipt } from "@/api/endpoints/delivery-receipts/delivery-receipts";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DetailProperty, DetailsCard } from "@/components/ui/details-card";
import { Header } from "@/components/ui/header";
import { ProgressSummary } from "@/components/ui/progress-summary";
import { CustomerCard } from "@/features/customers/components/customer-card.component";
import { formatDate } from "@/lib/format-date";
import { useParams } from "@tanstack/react-router";
import { HeaderActionsGroup } from "../components/header-actions-group";
import StatesTimeline from "../components/states-timeline";
import { columns } from "../definition/line-items";
import entityToBadge from "../lib/entity-to-badge";

export default function ViewDeliveryPage() {
  const params = useParams({ from: "/deliveries/$deliveryId/" });
  const {
    data: delivery,
    isLoading,
    isError,
  } = useGetDeliveryReceipt(params.deliveryId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  const entity = {
    id: delivery.id,
  };

  const badge = entityToBadge(delivery);

  const lineItems =
    delivery?.lineItems?.map((lineItem) => {
      return {
        name: lineItem.purchaseOrderLineItem.name,
        description: lineItem.purchaseOrderLineItem.description,
        ordered: lineItem.purchaseOrderLineItem.quantity,
        delivered: lineItem.quantity,
      };
    }) || [];

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Deliveries" entity={entity} badge={badge}>
        <HeaderActionsGroup deliveryReceipt={delivery} />
      </Header>

      <div className="grid grid-cols-3 gap-3 px-6">
        <div className="grid col-span-2 gap-3">
          <DetailsCard details="Details">
            <DetailProperty
              header="Date Created"
              value={formatDate(delivery.createDate)}
            />
            <DetailProperty header="Attachment" value="3 Files" />
          </DetailsCard>
          <CustomerCard customer={delivery.purchaseOrder.customer} />
        </div>

        <ProgressSummary title="Delivery Progress">
          <StatesTimeline delivery={delivery} />
        </ProgressSummary>
        <div className="col-span-3">
          <DataTable data={lineItems} columns={columns} enableSearch={true} />
        </div>
      </div>
    </main>
  );
}

import { useGetPurchaseOrder } from "@/api/endpoints/purchase-orders/purchase-orders";
import { type DeliveryReceiptLineItemDto } from "@/api/models";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DetailProperty, DetailsCard } from "@/components/ui/details-card";
import { Header } from "@/components/ui/header";
import { ProgressCard } from "@/components/ui/progress-card";
import { ProgressSummary } from "@/components/ui/progress-summary";
import { CustomerCard } from "@/features/customers/components/customer-card.component";
import { columns } from "@/features/purchase-orders/definition/line-items";
import { formatDate } from "@/lib/format-date";
import { useParams } from "@tanstack/react-router";
import { complement, filter, isNil, map, pipe, reduce, sum, uniq } from "ramda";
import { HeaderActionsGroup } from "../components/view-header-actions-group";
import entityToBadge from "../lib/entity-to-badge";

const totalPropFn =
  <T, P extends keyof T>(prop: P) =>
  (result: number, current: T): number =>
    result + (current[prop] as unknown as number);
const totalDeliveredFn = totalPropFn<{ quantity: number }, "quantity">(
  "quantity",
);
const totalInvoicedFn = totalPropFn<{ amount: number }, "amount">("amount");
const totalDeliveredReduce = reduce<{ quantity: number }, number>(
  totalDeliveredFn,
  0,
);
const totalInvoicedReduce = reduce<{ amount: number }, number>(
  totalInvoicedFn,
  0,
);

export default function ViewPurchaseOrderPage() {
  const params = useParams({ from: "/purchase-orders/$purchaseOrderId/" });
  const {
    data: purchaseOrder,
    isLoading,
    isError,
  } = useGetPurchaseOrder(params.purchaseOrderId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  const entity = {
    id: purchaseOrder.id,
  };

  const badge = entityToBadge(purchaseOrder);
  const lineItems =
    purchaseOrder?.lineItems?.map((lineItem) => {
      const total =
        (totalDeliveredReduce(lineItem.deliveries) / lineItem.quantity) * 100;
      return {
        name: lineItem.name,
        description: lineItem.description,
        price: lineItem.unitPrice,
        quantity: lineItem.quantity,
        progress: total,
        lineItem,
      };
    }) || [];

  const deliveries = purchaseOrder.lineItems.flatMap((li) => li.deliveries);
  const totalDelivered = totalDeliveredReduce(deliveries);
  const deliveryReceipts = pipe(
    map<DeliveryReceiptLineItemDto, number>(
      (delivery) => delivery.deliveryReceipt.id,
    ),
    uniq,
  )(deliveries);

  const requiredDeliveries = totalDeliveredReduce(purchaseOrder.lineItems);
  const invoices = pipe(
    filter(complement(isNil)),
    uniq,
  )(
    purchaseOrder.lineItems.flatMap((li) =>
      li.deliveries.map((delivery) => delivery.deliveryReceipt.invoice?.id),
    ),
  );
  const totalInvoiced = totalInvoicedReduce(
    purchaseOrder.lineItems.flatMap((li) =>
      li.deliveries.map((delivery) => {
        if (!delivery.deliveryReceipt.invoice) return { amount: 0 };
        return {
          amount: delivery.quantity * delivery.purchaseOrderLineItem.unitPrice,
        };
      }),
    ),
  );

  const totalPurchaseOrderPrice = sum(
    purchaseOrder.lineItems.map((li) => li.unitPrice * li.quantity),
  );

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Purchase Orders" entity={entity} badge={badge}>
        <HeaderActionsGroup purchaseOrder={purchaseOrder} />
      </Header>

      <div className="grid grid-cols-3 gap-3 px-6">
        <div className="grid col-span-2 gap-3">
          <DetailsCard details="Details">
            <DetailProperty
              header="Date Created"
              value={formatDate(purchaseOrder.createDate)}
            />
            <DetailProperty header="Attachment" value="3 Files" />
            <DetailProperty header="Notes" value={purchaseOrder.notes || "-"} />
          </DetailsCard>
          <CustomerCard customer={purchaseOrder.customer} />
        </div>

        <ProgressSummary title="Progress Summary">
          <ProgressCard
            title="Total Delivered"
            value={totalDelivered}
            total={requiredDeliveries}
            verb="delivered"
            link={
              deliveryReceipts.length > 0 &&
              `/deliveries?ids=[${deliveryReceipts.join(",")}]`
            }
          />

          <ProgressCard
            title="Total Invoiced"
            value={totalInvoiced}
            total={totalPurchaseOrderPrice}
            money={true}
            verb="billed"
            link={
              invoices.length > 0 && `/invoices?ids=[${invoices.join(",")}]`
            }
          />
        </ProgressSummary>
        <div className="col-span-3">
          <DataTable data={lineItems} columns={columns} enableSearch={true} />
        </div>
      </div>
    </main>
  );
}

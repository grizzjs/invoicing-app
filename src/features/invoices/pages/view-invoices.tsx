import { useGetInvoice } from "@/api/endpoints/invoices/invoices";
import type { DeliveryReceiptDto } from "@/api/models";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DetailProperty, DetailsCard } from "@/components/ui/details-card";
import { Header } from "@/components/ui/header";
import { Key } from "@/components/ui/key-pair/key";
import { Value } from "@/components/ui/key-pair/value";
import { ProgressSummary } from "@/components/ui/progress-summary";
import { CustomerCard } from "@/features/customers/components/customer-card.component";
import { formatDate } from "@/lib/format-date";
import format from "@/lib/format-money";
import { parseDateFromISO } from "@/lib/parse-date";
import { Link, useParams } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { map, pipe, uniq } from "ramda";
import { HeaderActionsGroup } from "../components/header-actions-group";
import { columns } from "../definition/line-items";
import entityToBadge from "../lib/entity-to-badge";

export default function ViewInvoicesPage() {
  const params = useParams({ from: "/invoices/$invoiceId/" });
  const { data: invoice, isLoading, isError } = useGetInvoice(params.invoiceId);

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  const entity = {
    id: invoice.id,
  };

  const badge = entityToBadge(invoice);

  const lineItems =
    invoice.deliveryReceipts?.flatMap((delivery) => {
      return delivery.lineItems.map((lineItem) => {
        return {
          name: lineItem.purchaseOrderLineItem.name,
          description: lineItem.purchaseOrderLineItem.description,
          quantity: lineItem.quantity,
          unitPrice: lineItem.purchaseOrderLineItem.unitPrice,
          amount: lineItem.quantity * lineItem.purchaseOrderLineItem.unitPrice,
        };
      });
    }) || [];

  const purchaseOrders = pipe(
    map((delivery: DeliveryReceiptDto) => {
      return delivery.purchaseOrder.id;
    }),
    uniq,
  )(invoice.deliveryReceipts);

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Invoices" entity={entity} badge={badge}>
        <HeaderActionsGroup />
      </Header>

      <div className="grid grid-cols-3 gap-3 px-6">
        <DetailsCard details="Details" className="col-span-2">
          <DetailProperty
            header="Date Created"
            value={formatDate(invoice.createDate)}
          />
          <DetailProperty header="Purchase Order Number">
            {purchaseOrders.map((purchaseOrder, index) => {
              return (
                <Link key={index} to={`/purchase-orders/${purchaseOrder}`}>
                  <span className="underline">{purchaseOrder}</span>
                  {index + 1 == purchaseOrders.length ? "" : ", "}
                </Link>
              );
            })}
          </DetailProperty>
          <DetailProperty
            header="Payment Terms"
            value={`${invoice.dueInDays} days`}
          />
          <DetailProperty header="Delivery Number/s">
            {invoice.deliveryReceipts?.map((delivery, index) => {
              return (
                <Link key={index} to={`/deliveries/${delivery.id}`}>
                  <span className="underline">{delivery.id}</span>
                  {index + 1 == invoice.deliveryReceipts.length ? "" : ", "}
                </Link>
              );
            })}
          </DetailProperty>
          <DetailProperty
            header="Due Date"
            value={formatDate(
              parseDateFromISO(invoice.createDate).plus({
                days: invoice.dueInDays,
              }),
            )}
          />
          <DetailProperty header="Attachment" value="3 Files" />
        </DetailsCard>
        <ProgressSummary title="Summary">
          <div>
            <p className="text-3xl font-medium text-foreground mb-0.5">
              {format(invoice.amount)}
            </p>
            <p className="text-sm text-muted-foreground mb-5">Amount</p>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-2">
            <Key>Date Paid</Key>
            <Value className="justify-self-end">
              {formatDate("2026-01-01T00:00:00Z")}
            </Value>
            <Key>Collection Number</Key>
            <Link to={`/collections/${invoice.collection?.id}`}>
              <span className="underline">
                <Value className="justify-self-end">
                  {invoice.collection?.id}
                </Value>
              </span>
            </Link>
          </div>

          <Button
            variant="secondary"
            className="mt-5 w-full py-2.5 px-3 text-sm"
            asChild
          >
            <Link to={`official-receipt`} target="_blank">
              <Printer className="h-4 w-4" />
              View Official Receipt
            </Link>
          </Button>
        </ProgressSummary>
        <CustomerCard customer={invoice.customer} className="col-span-3" />
        <DataTable
          data={lineItems}
          columns={columns}
          enableSearch={true}
          className="col-span-3"
        />
      </div>
    </main>
  );
}

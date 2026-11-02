import { useGetJobOrder } from "@/api/endpoints/job-orders/job-orders";
import { useGetFiles } from "@/api/endpoints/s3/s3";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DetailProperty, DetailsCard } from "@/components/ui/details-card";
import { Header } from "@/components/ui/header";
import { ProgressCard } from "@/components/ui/progress-card";
import { ProgressSummary } from "@/components/ui/progress-summary";
import { CustomerCard } from "@/features/customers/components/customer-card.component";
import { formatDate } from "@/lib/format-date";
import { useParams } from "@tanstack/react-router";
import { sum } from "ramda";
import { useState } from "react";
import AttachmentsDialog from "../components/attachments-dialog";
import { HeaderActionsGroup } from "../components/view-header-actions-group";
import { columns } from "../definition/line-items";
import entityToBadge from "../lib/entity-to-badge";

export default function ViewJobOrderPage() {
  const params = useParams({ from: "/job-orders/$jobOrderId/" });
  const {
    data: jobOrder,
    isLoading,
    isError,
  } = useGetJobOrder(Number(params.jobOrderId));

  const { data: files = [] } = useGetFiles(
    "job-orders",
    params.jobOrderId,
  );

  const [attachmentsOpen, setAttachmentsOpen] = useState(false);

  if (isLoading) return <p>Loading...</p>;
  if (isError || !jobOrder) return <p>Error loading job order...</p>;

  const entity = {
    id: jobOrder.id,
  };

  const badge = entityToBadge(jobOrder);
  const lineItems =
    jobOrder.lineItems?.map((lineItem) => ({
      name: lineItem.name,
      description: lineItem.description,
      price: lineItem.unitPrice,
      quantity: lineItem.quantity,
      lineItem,
    })) || [];

  const totalJobOrderPrice = sum(
    (jobOrder.lineItems ?? []).map((li) => li.unitPrice * li.quantity),
  );

  const totalInvoiced = jobOrder.invoice
    ? (jobOrder.invoice.amount ?? totalJobOrderPrice)
    : 0;

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Job Orders" entity={entity} badge={badge}>
        <HeaderActionsGroup jobOrder={jobOrder} />
      </Header>

      <div className="grid grid-cols-3 gap-3 px-6">
        <div className="grid col-span-2 gap-3">
          <DetailsCard details="Details">
            <DetailProperty
              header="Date Created"
              value={formatDate(jobOrder.createDate)}
            />
            <DetailProperty header="Attachment">
              <button
                type="button"
                onClick={() => setAttachmentsOpen(true)}
                className="text-sm text-gray-800 underline underline-offset-2 hover:text-gray-600 transition"
              >
                {files.length === 0
                  ? "No files"
                  : `${files.length} ${files.length === 1 ? "File" : "Files"}`}
              </button>
            </DetailProperty>
            <DetailProperty header="Notes" value={jobOrder.notes || "-"} />
          </DetailsCard>
          {jobOrder.customer && <CustomerCard customer={jobOrder.customer} />}
        </div>

        <ProgressSummary title="Progress Summary">
          <ProgressCard
            title="Total Invoiced"
            value={totalInvoiced}
            total={totalJobOrderPrice}
            money={true}
            verb="billed"
            link={
              jobOrder.invoice?.id
                ? `/invoices/${jobOrder.invoice.id}`
                : undefined
            }
          />
        </ProgressSummary>

        <div className="col-span-3">
          <DataTable
            data={lineItems}
            columns={columns}
            enableSearch={true}
            defaultSorting={[{ id: "name", desc: false }]}
          />
        </div>
      </div>

      <AttachmentsDialog
        open={attachmentsOpen}
        onOpenChange={setAttachmentsOpen}
        jobOrderId={jobOrder.id}
        files={files}
      />
    </main>
  );
}

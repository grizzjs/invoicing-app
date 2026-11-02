import {
  createJobOrderLineItem,
  deleteJobOrderLineItem,
  updateJobOrderLineItem,
} from "@/api/endpoints/line-items/line-items";
import {
  updateJobOrder,
  useGetJobOrder,
} from "@/api/endpoints/job-orders/job-orders";
import { useGetFiles } from "@/api/endpoints/s3/s3";
import { Header } from "@/components/ui/header";
import { uploadFiles } from "@/features/common/lib/upload-files";
import isIn from "@/lib/is-in";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import JobOrderForm, {
  type JobOrderFormValues,
} from "../components/job-order-form";
import Status from "../enum";
import entityToBadge from "../lib/entity-to-badge";

export default function EditJobOrderPage() {
  const params = useParams({ from: "/job-orders/$jobOrderId/edit" });
  const {
    data: jobOrder,
    isLoading,
    isError,
  } = useGetJobOrder(Number(params.jobOrderId));

  const { data: existingFiles = [] } = useGetFiles(
    "job-orders",
    params.jobOrderId,
  );

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (isLoading) return <p>Loading...</p>;
  if (isError || !jobOrder) return <p>Error loading job order...</p>;

  const viewPath = `/job-orders/${jobOrder.id}`;
  const { customer } = jobOrder;

  const save = async (
    { notes, lineItems }: JobOrderFormValues,
    files: File[],
  ) => {
    const keptIds = lineItems
      .map((lineItem) => lineItem.id)
      .filter((id): id is number => typeof id === "number");

    await Promise.all([
      updateJobOrder(jobOrder.id, {
        status: jobOrder.status,
        notes,
      }),
      ...(jobOrder.lineItems ?? [])
        .filter((lineItem) => !keptIds.includes(lineItem.id))
        .map((lineItem) =>
          deleteJobOrderLineItem(jobOrder.id, lineItem.id),
        ),
      ...lineItems.map(({ id, ...lineItem }) =>
        id
          ? updateJobOrderLineItem(jobOrder.id, id, lineItem)
          : createJobOrderLineItem(jobOrder.id, lineItem),
      ),
    ]);
    if (files.length > 0) {
      await uploadFiles("job-orders", jobOrder.id, files);
    }
    await queryClient.invalidateQueries({ queryKey: ["/job-orders"] });
    navigate({ to: viewPath });
  };

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header
        title="Job Orders"
        entity={{ id: jobOrder.id }}
        action="Edit"
        badge={entityToBadge(jobOrder)}
      />

      {isIn([Status.Draft, Status.Finalized], jobOrder.status) ? (
        <JobOrderForm
          customers={customer ? [customer] : []}
          createDate={jobOrder.createDate}
          lockCustomer={true}
          cancelTo={viewPath}
          existingFiles={existingFiles}
          defaultValues={{
            customer: { id: customer?.id ?? -1 },
            address: customer?.address ?? "",
            phoneNumber: customer?.phoneNumber ?? "",
            email: customer?.email ?? "",
            tin: customer?.tin ?? "",
            notes: jobOrder.notes ?? "",
            lineItems: (jobOrder.lineItems ?? []).map((lineItem) => ({
              id: lineItem.id,
              name: lineItem.name,
              description: lineItem.description ?? "",
              quantity: lineItem.quantity,
              unitPrice: lineItem.unitPrice,
            })),
          }}
          onSubmit={save}
        />
      ) : (
        <p className="px-6">
          Only draft or finalized job orders can be edited.
        </p>
      )}
    </main>
  );
}

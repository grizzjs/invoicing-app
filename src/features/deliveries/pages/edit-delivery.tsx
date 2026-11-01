import {
  getGetDeliveryReceiptQueryKey,
  getGetDeliveryReceiptsQueryKey,
  useGetDeliveryReceipt,
} from "@/api/endpoints/delivery-receipts/delivery-receipts";
import {
  createDeliveryReceiptLineItem,
  deleteDeliveryReceiptLineItem,
  updateDeliveryReceiptLineItem,
} from "@/api/endpoints/line-items/line-items";
import {
  getGetPurchaseOrderQueryKey,
  useGetPurchaseOrder,
} from "@/api/endpoints/purchase-orders/purchase-orders";
import { useGetFiles } from "@/api/endpoints/s3/s3";
import { Header } from "@/components/ui/header";
import { uploadFiles } from "@/features/common/lib/upload-files";
import isIn from "@/lib/is-in";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import DeliveryForm, {
  type DeliveryFormValues,
} from "../components/delivery-form";
import Status from "../enum";
import entityToBadge from "../lib/entity-to-badge";
import toLineItemOption from "../lib/to-line-item-option";

export default function EditDeliveryPage() {
  const params = useParams({ from: "/deliveries/$deliveryId/edit" });
  const {
    data: delivery,
    isLoading: isDeliveryLoading,
    isError: isDeliveryError,
  } = useGetDeliveryReceipt(params.deliveryId);
  // The delivery's purchase order comes without line items, so they are
  // fetched from the purchase order itself.
  const purchaseOrderId = delivery?.purchaseOrder.id;
  const {
    data: purchaseOrder,
    isLoading: isPurchaseOrderLoading,
    isError: isPurchaseOrderError,
  } = useGetPurchaseOrder(purchaseOrderId, {
    query: { enabled: !!purchaseOrderId },
  });

  const { data: existingFiles = [] } = useGetFiles(
    "deliveries",
    params.deliveryId,
  );

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (isDeliveryLoading || isPurchaseOrderLoading || !purchaseOrder)
    return <p>Loading...</p>;
  if (isDeliveryError || isPurchaseOrderError) return <p>Error...</p>;

  const viewPath = `/deliveries/${delivery.id}`;
  const { customer } = delivery.purchaseOrder;

  const lineItemOptions = purchaseOrder.lineItems
    .map((lineItem) => toLineItemOption(lineItem, delivery.id))
    .filter((li) => li.remainingQuantity > 0);

  // Rows are matched to the delivery's line items by purchase order line
  // item: removed rows are deleted, existing rows updated and new rows
  // created.
  const save = async ({ lineItems }: DeliveryFormValues, files: File[]) => {
    const keptIds = lineItems.map((lineItem) => lineItem.id);
    await Promise.all([
      ...delivery.lineItems
        .filter(
          (lineItem) => !keptIds.includes(lineItem.purchaseOrderLineItem.id),
        )
        .map((lineItem) =>
          deleteDeliveryReceiptLineItem(delivery.id, lineItem.id),
        ),
      ...lineItems.map(({ id, deliveryQuantity }) => {
        const existing = delivery.lineItems.find(
          (lineItem) => lineItem.purchaseOrderLineItem.id === id,
        );
        return existing
          ? updateDeliveryReceiptLineItem(delivery.id, existing.id, {
              quantity: deliveryQuantity,
            })
          : createDeliveryReceiptLineItem(delivery.id, {
              quantity: deliveryQuantity,
              purchaseOrderLineItem: { id },
            });
      }),
    ]);
    if (files.length > 0) {
      await uploadFiles("deliveries", delivery.id, files);
    }
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: getGetDeliveryReceiptQueryKey(delivery.id),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetDeliveryReceiptsQueryKey(),
      }),
      queryClient.invalidateQueries({
        queryKey: getGetPurchaseOrderQueryKey(purchaseOrder.id),
      }),
    ]);
    navigate({ to: viewPath });
  };

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header
        title="Deliveries"
        entity={{ id: delivery.id }}
        action="Edit"
        badge={entityToBadge(delivery)}
      />

      {isIn([Status.New], delivery.status) ? (
        <DeliveryForm
          purchaseOrderId={purchaseOrder.id}
          createDate={delivery.createDate}
          lineItemOptions={lineItemOptions}
          cancelTo={viewPath}
          existingFiles={existingFiles}
          defaultValues={{
            customer: customer.name,
            address: customer.address,
            phoneNumber: customer.phoneNumber,
            email: customer.email,
            tin: customer.tin,
            lineItems: delivery.lineItems.map((lineItem) => {
              const option = lineItemOptions.find(
                (li) => li.id === lineItem.purchaseOrderLineItem.id,
              );
              return {
                id: lineItem.purchaseOrderLineItem.id,
                orderedQuantity: lineItem.purchaseOrderLineItem.quantity,
                remainingQuantity: option?.remainingQuantity ?? 0,
                deliveryQuantity: lineItem.quantity,
              };
            }),
          }}
          onSubmit={save}
        />
      ) : (
        <p className="px-6">Only new deliveries can be edited.</p>
      )}
    </main>
  );
}

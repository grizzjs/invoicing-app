import {
  createPurchaseOrderLineItem,
  deletePurchaseOrderLineItem,
  updatePurchaseOrderLineItem,
} from "@/api/endpoints/line-items/line-items";
import {
  updatePurchaseOrder,
  useGetPurchaseOrder,
} from "@/api/endpoints/purchase-orders/purchase-orders";
import { Header } from "@/components/ui/header";
import isIn from "@/lib/is-in";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import PurchaseOrderForm, {
  type PurchaseOrderFormValues,
} from "../components/purchase-order-form";
import Status from "../enum";
import entityToBadge from "../lib/entity-to-badge";

export default function EditPurchaseOrderPage() {
  const params = useParams({ from: "/purchase-orders/$purchaseOrderId/edit" });
  const {
    data: purchaseOrder,
    isLoading,
    isError,
  } = useGetPurchaseOrder(params.purchaseOrderId);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error...</p>;

  const viewPath = `/purchase-orders/${purchaseOrder.id}`;
  const { customer } = purchaseOrder;

  // Notes are saved on the purchase order itself. Line items are saved through
  // the line item endpoints: removed rows are deleted, existing rows updated
  // and new rows created.
  const save = async ({ notes, lineItems }: PurchaseOrderFormValues) => {
    const keptIds = lineItems.map((lineItem) => lineItem.id);
    await Promise.all([
      updatePurchaseOrder(purchaseOrder.id, {
        status: purchaseOrder.status,
        notes,
      }),
      ...purchaseOrder.lineItems
        .filter((lineItem) => !keptIds.includes(lineItem.id))
        .map((lineItem) =>
          deletePurchaseOrderLineItem(purchaseOrder.id, lineItem.id),
        ),
      ...lineItems.map(({ id, ...lineItem }) =>
        id
          ? updatePurchaseOrderLineItem(purchaseOrder.id, id, lineItem)
          : createPurchaseOrderLineItem(purchaseOrder.id, lineItem),
      ),
    ]);
    await queryClient.invalidateQueries({ queryKey: ["/purchase-orders"] });
    navigate({ to: viewPath });
  };

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header
        title="Purchase Orders"
        entity={{ id: purchaseOrder.id }}
        action="Edit"
        badge={entityToBadge(purchaseOrder)}
      />

      {isIn([Status.Draft, Status.Finalized], purchaseOrder.status) ? (
        <PurchaseOrderForm
          customers={[customer]}
          createDate={purchaseOrder.createDate}
          lockCustomer={true}
          cancelTo={viewPath}
          defaultValues={{
            customer: { id: customer.id },
            address: customer.address,
            phoneNumber: customer.phoneNumber,
            email: customer.email,
            tin: customer.tin,
            notes: purchaseOrder.notes ?? "",
            lineItems: purchaseOrder.lineItems.map((lineItem) => ({
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
          Only draft or finalized purchase orders can be edited.
        </p>
      )}
    </main>
  );
}

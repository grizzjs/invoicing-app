import { useGetCustomer } from "@/api/endpoints/customers/customers";
import { useCreateDeliveryReceipt } from "@/api/endpoints/delivery-receipts/delivery-receipts";
import { useGetPurchaseOrder } from "@/api/endpoints/purchase-orders/purchase-orders";
import { Header } from "@/components/ui/header";
import { today } from "@/lib/date-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import DeliveryForm from "../components/delivery-form";
import toLineItemOption from "../lib/to-line-item-option";

declare module "@tanstack/react-router" {
  interface HistoryState {
    customerId?: number;
    ids?: number[];
    purchaseOrderId?: number;
  }
}

export default function CreateDeliveryPage() {
  const { customerId, ids, purchaseOrderId } = useRouterState({
    select: (s) =>
      s.location.state as unknown as {
        customerId: number;
        ids: number[];
        purchaseOrderId: number;
      },
  });

  const { data: customer, isLoading: isCustomerLoading } =
    useGetCustomer(customerId);
  const { data: purchaseOrder, isLoading: isPurchaseOrder } =
    useGetPurchaseOrder(purchaseOrderId);

  const { mutate } = useCreateDeliveryReceipt();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (isCustomerLoading || isPurchaseOrder) return <div>"Loading..."</div>;

  const lineItemOptions = purchaseOrder.lineItems
    .map((lineItem) => toLineItemOption(lineItem))
    .filter((li) => li.remainingQuantity > 0);

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Deliveries" action="Create"></Header>

      <DeliveryForm
        purchaseOrderId={purchaseOrderId}
        createDate={today()}
        lineItemOptions={lineItemOptions}
        cancelTo="/deliveries"
        defaultValues={{
          customer: customer.name,
          address: customer.address,
          phoneNumber: customer.phoneNumber,
          email: customer.email,
          tin: customer.tin,
          lineItems: lineItemOptions.filter((li) => ids.includes(li.id)),
        }}
        onSubmit={(values) =>
          mutate(
            {
              data: {
                purchaseOrder: {
                  id: purchaseOrderId,
                },
                createDate: new Date().toISOString(),
                lineItems: values.lineItems.map((li) => ({
                  quantity: li.deliveryQuantity,
                  purchaseOrderLineItem: {
                    id: li.id,
                  },
                })),
              },
            },
            {
              onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: ["/deliveries"] });
                navigate({ to: `/deliveries/${data.id}` });
              },
            },
          )
        }
      />
    </main>
  );
}

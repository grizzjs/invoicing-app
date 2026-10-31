import { useGetCustomers } from "@/api/endpoints/customers/customers";
import { useCreatePurchaseOrder } from "@/api/endpoints/purchase-orders/purchase-orders";
import { Header } from "@/components/ui/header";
import { today } from "@/lib/date-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import PurchaseOrderForm from "../components/purchase-order-form";

export default function CreatePurchaseOrderPage() {
  const { data: customers, isLoading } = useGetCustomers();
  const { mutate } = useCreatePurchaseOrder();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (isLoading) return <div>"Loading..."</div>;

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Purchase Orders" action="Create"></Header>

      <PurchaseOrderForm
        customers={customers}
        createDate={today()}
        cancelTo="/purchase-orders"
        onSubmit={(values) =>
          mutate(
            {
              data: {
                customer: {
                  id: values.customer.id,
                },
                status: "Finalized",
                notes: values.notes,
                createDate: new Date().toISOString(),
                lineItems: values.lineItems,
              },
            },
            {
              onSuccess: (data) => {
                queryClient.invalidateQueries({
                  queryKey: ["/purchase-orders"],
                });
                navigate({ to: `/purchase-orders/${data.id}` });
              },
            },
          )
        }
      />
    </main>
  );
}

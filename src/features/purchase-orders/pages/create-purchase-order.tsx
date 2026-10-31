import { useGetCustomers } from "@/api/endpoints/customers/customers";
import { useCreatePurchaseOrder } from "@/api/endpoints/purchase-orders/purchase-orders";
import { uploadFile } from "@/api/endpoints/s3/s3";
import { Header } from "@/components/ui/header";
import { today } from "@/lib/date-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import PurchaseOrderForm from "../components/purchase-order-form";

async function uploadFiles(purchaseOrderId: number, files: File[]) {
  await Promise.all(
    files.map((file) => uploadFile("purchase-orders", String(purchaseOrderId), { file })),
  );
}

export default function CreatePurchaseOrderPage() {
  const { data: customers, isLoading } = useGetCustomers();
  const { mutateAsync } = useCreatePurchaseOrder();

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
        onSubmit={async (values, files) => {
          const data = await mutateAsync({
            data: {
              customer: {
                id: values.customer.id,
              },
              status: "Finalized",
              createDate: new Date().toISOString(),
              lineItems: values.lineItems,
            },
          });
          if (files.length > 0) {
            await uploadFiles(data.id, files);
          }
          await queryClient.invalidateQueries({ queryKey: ["/purchase-orders"] });
          navigate({ to: `/purchase-orders/${data.id}` });
        }}
      />
    </main>
  );
}

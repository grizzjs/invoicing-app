import { useGetCustomers } from "@/api/endpoints/customers/customers";
import { useCreateJobOrder } from "@/api/endpoints/job-orders/job-orders";
import { Header } from "@/components/ui/header";
import { uploadFiles } from "@/features/common/lib/upload-files";
import { today } from "@/lib/date-utils";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import JobOrderForm from "../components/job-order-form";

export default function CreateJobOrderPage() {
  const { data: customers = [], isLoading } = useGetCustomers();
  const { mutateAsync } = useCreateJobOrder();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  if (isLoading) return <div>Loading...</div>;

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Job Orders" action="Create" />

      <JobOrderForm
        customers={customers}
        createDate={today()}
        cancelTo="/job-orders"
        onSubmit={async (values, files) => {
          const data = await mutateAsync({
            data: {
              customer: { id: values.customer.id },
              status: "Finalized",
              notes: values.notes,
              createDate: new Date().toISOString(),
              lineItems: values.lineItems,
            },
          });
          if (files.length > 0) {
            await uploadFiles("job-orders", data.id, files);
          }
          await queryClient.invalidateQueries({
            queryKey: ["/job-orders"],
          });
          navigate({ to: `/job-orders/${data.id}` });
        }}
      />
    </main>
  );
}

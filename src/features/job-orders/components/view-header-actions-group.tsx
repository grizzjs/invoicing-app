import {
  getGetJobOrderQueryKey,
  useUpdateJobOrder,
} from "@/api/endpoints/job-orders/job-orders";
import type { JobOrderDto } from "@/api/models";
import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/ui/header-actions";
import InvoiceDialog from "@/features/invoices/components/invoice-dialog";
import isIn from "@/lib/is-in";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Pencil, Printer } from "lucide-react";
import { useState } from "react";
import Status from "../enum";
import ConfirmDialog from "./confirm-dialog";

type HeaderActionsGroupProps = {
  jobOrder: JobOrderDto;
};

export function HeaderActionsGroup({ jobOrder }: HeaderActionsGroupProps) {
  const { mutate: finalizeJobOrder, isPending: isFinalizing } =
    useUpdateJobOrder();
  const { mutate: approveJobOrder, isPending: isApproving } =
    useUpdateJobOrder();
  const { mutate: cancelJobOrder, isPending: isCancelling } =
    useUpdateJobOrder();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<
    "finalize" | "approve" | "cancel" | null
  >(null);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/job-orders"] });
    queryClient.invalidateQueries({
      queryKey: getGetJobOrderQueryKey(jobOrder.id),
    });
    setConfirming(null);
  };

  const finalize = () =>
    finalizeJobOrder(
      {
        id: jobOrder.id,
        data: { status: Status.Finalized, notes: jobOrder.notes },
      },
      { onSuccess },
    );

  const approve = () =>
    approveJobOrder(
      {
        id: jobOrder.id,
        data: { status: Status.Approved, notes: jobOrder.notes },
      },
      { onSuccess },
    );

  const cancel = () =>
    cancelJobOrder(
      {
        id: jobOrder.id,
        data: { status: Status.Cancelled, notes: jobOrder.notes },
      },
      { onSuccess },
    );

  return (
    <>
      <HeaderActions>
        {isIn([Status.Draft], jobOrder.status) && (
          <Button onClick={() => setConfirming("finalize")}>
            Finalize Order
          </Button>
        )}
        {isIn([Status.Finalized], jobOrder.status) && (
          <Button onClick={() => setConfirming("approve")}>
            Approve Order
          </Button>
        )}
        {isIn([Status.Draft, Status.Finalized], jobOrder.status) && (
          <Button variant="outline" onClick={() => setConfirming("cancel")}>
            Cancel Order
          </Button>
        )}
        {isIn([Status.Approved], jobOrder.status) && !jobOrder.invoice && (
          <Button variant="outline" onClick={() => setCreatingInvoice(true)}>
            Create Invoice
          </Button>
        )}
      </HeaderActions>
      <div className="h-5 w-px bg-gray-300" />
      <HeaderActions>
        {isIn([Status.Draft, Status.Finalized], jobOrder.status) && (
          <Button variant="outline" asChild>
            <Link to="edit">
              <Pencil /> Edit
            </Link>
          </Button>
        )}

        <Button variant="outline" asChild>
          <Link to="pdf" target="_blank">
            <Printer /> Print
          </Link>
        </Button>
      </HeaderActions>

      <ConfirmDialog
        open={confirming === "finalize"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Finalize Order"
        description={`Finalize job order #${jobOrder.id}? It will be ready for approval.`}
        confirmLabel="Finalize Order"
        pendingLabel="Finalizing..."
        isPending={isFinalizing}
        onConfirm={finalize}
      />
      <ConfirmDialog
        open={confirming === "approve"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Approve Order"
        description={`Approve job order #${jobOrder.id}? It can no longer be edited after approval.`}
        confirmLabel="Approve Order"
        pendingLabel="Approving..."
        isPending={isApproving}
        onConfirm={approve}
      />
      <ConfirmDialog
        open={confirming === "cancel"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Cancel Order"
        description={`Cancel job order #${jobOrder.id}? This cannot be undone.`}
        confirmLabel="Cancel Order"
        pendingLabel="Cancelling..."
        confirmVariant="destructive"
        isPending={isCancelling}
        onConfirm={cancel}
      />
      <InvoiceDialog
        open={creatingInvoice}
        onOpenChange={setCreatingInvoice}
        jobOrderId={jobOrder.id}
      />
    </>
  );
}

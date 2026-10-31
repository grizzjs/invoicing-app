import {
  getGetPurchaseOrderQueryKey,
  useUpdatePurchaseOrder,
} from "@/api/endpoints/purchase-orders/purchase-orders";
import type { PurchaseOrderDto } from "@/api/models";
import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/ui/header-actions";
import PurchaseOrderDialog from "@/features/deliveries/components/purchase-order-dialog";
import isIn from "@/lib/is-in";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Pencil, Printer } from "lucide-react";
import { useState } from "react";
import Status from "../enum";
import ConfirmDialog from "./confirm-dialog";

type HeaderActionsGroupProps = {
  purchaseOrder: PurchaseOrderDto;
};

export function HeaderActionsGroup({ purchaseOrder }: HeaderActionsGroupProps) {
  const { mutate: finalizePurchaseOrder, isPending: isFinalizing } =
    useUpdatePurchaseOrder();
  const { mutate: approvePurchaseOrder, isPending: isApproving } =
    useUpdatePurchaseOrder();
  const { mutate: cancelPurchaseOrder, isPending: isCancelling } =
    useUpdatePurchaseOrder();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState<
    "finalize" | "approve" | "cancel" | null
  >(null);
  const [creatingDelivery, setCreatingDelivery] = useState(false);

  const fullyDelivered = purchaseOrder.lineItems.every(
    (lineItem) =>
      lineItem.deliveries.reduce((res, current) => res + current.quantity, 0) >=
      lineItem.quantity,
  );

  const onSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["/purchase-orders"] });
    queryClient.invalidateQueries({
      queryKey: getGetPurchaseOrderQueryKey(purchaseOrder.id),
    });
    setConfirming(null);
  };

  const finalize = () =>
    finalizePurchaseOrder(
      { id: purchaseOrder.id, data: { status: Status.Finalized } },
      { onSuccess },
    );

  const approve = () =>
    approvePurchaseOrder(
      { id: purchaseOrder.id, data: { status: Status.Approved } },
      { onSuccess },
    );

  const cancel = () =>
    cancelPurchaseOrder(
      { id: purchaseOrder.id, data: { status: Status.Cancelled } },
      { onSuccess },
    );

  return (
    <>
      <HeaderActions>
        {isIn([Status.Draft], purchaseOrder.status) && (
          <Button onClick={() => setConfirming("finalize")}>
            Finalize Order
          </Button>
        )}
        {isIn([Status.Finalized], purchaseOrder.status) && (
          <Button onClick={() => setConfirming("approve")}>
            Approve Order
          </Button>
        )}
        {isIn([Status.Draft, Status.Finalized], purchaseOrder.status) && (
          <Button variant="outline" onClick={() => setConfirming("cancel")}>
            Cancel Order
          </Button>
        )}
        {isIn([Status.Approved], purchaseOrder.status) && !fullyDelivered && (
          <Button variant="outline" onClick={() => setCreatingDelivery(true)}>
            Create Delivery Receipt
          </Button>
        )}
        {isIn([Status.Pending], purchaseOrder.status) && (
          <Button variant="outline">Create Sales Invoice</Button>
        )}
      </HeaderActions>
      <div className="h-5 w-px bg-gray-300" />
      <HeaderActions>
        {isIn([Status.Draft, Status.Finalized], purchaseOrder.status) && (
          <Button variant="outline">
            <Pencil /> Edit
          </Button>
        )}

        <Button variant="outline" asChild>
          <Link to={`pdf`} target="_blank">
            <Printer /> Print
          </Link>
        </Button>
      </HeaderActions>

      <ConfirmDialog
        open={confirming === "finalize"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Finalize Order"
        description={`Finalize purchase order #${purchaseOrder.id}? It will be ready for approval.`}
        confirmLabel="Finalize Order"
        pendingLabel="Finalizing..."
        isPending={isFinalizing}
        onConfirm={finalize}
      />
      <ConfirmDialog
        open={confirming === "approve"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Approve Order"
        description={`Approve purchase order #${purchaseOrder.id}? It can no longer be edited after approval.`}
        confirmLabel="Approve Order"
        pendingLabel="Approving..."
        isPending={isApproving}
        onConfirm={approve}
      />
      <ConfirmDialog
        open={confirming === "cancel"}
        onOpenChange={(open) => !open && setConfirming(null)}
        title="Cancel Order"
        description={`Cancel purchase order #${purchaseOrder.id}? This cannot be undone.`}
        confirmLabel="Cancel Order"
        pendingLabel="Cancelling..."
        confirmVariant="destructive"
        isPending={isCancelling}
        onConfirm={cancel}
      />
      <PurchaseOrderDialog
        open={creatingDelivery}
        onOpenChange={setCreatingDelivery}
        purchaseOrder={purchaseOrder}
      />
    </>
  );
}

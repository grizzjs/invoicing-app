import {
  getGetDeliveryReceiptQueryKey,
  useUpdateDeliveryReceipt,
} from "@/api/endpoints/delivery-receipts/delivery-receipts";
import type { DeliveryReceiptDto } from "@/api/models";
import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/ui/header-actions";
import ConfirmDialog from "@/features/purchase-orders/components/confirm-dialog";
import isIn from "@/lib/is-in";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Pencil, Printer } from "lucide-react";
import { useState } from "react";
import Status from "../enum";

// Progress moves New -> Shipped -> Delivered. Delivered and later statuses
// have no next step, so the Update Progress button is hidden for them.
const nextStatuses: Partial<
  Record<DeliveryReceiptDto["status"], DeliveryReceiptDto["status"]>
> = {
  [Status.New]: Status.Shipped,
  [Status.Shipped]: Status.Delivered,
};

type HeaderActionsGroupProps = {
  deliveryReceipt: DeliveryReceiptDto;
};

export function HeaderActionsGroup({
  deliveryReceipt,
}: HeaderActionsGroupProps) {
  const { mutate: updateProgress, isPending: isUpdating } =
    useUpdateDeliveryReceipt();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const nextStatus = nextStatuses[deliveryReceipt.status];

  const update = () =>
    updateProgress(
      { id: deliveryReceipt.id, data: { status: nextStatus } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/delivery-receipts"] });
          queryClient.invalidateQueries({
            queryKey: getGetDeliveryReceiptQueryKey(deliveryReceipt.id),
          });
          setConfirming(false);
        },
      },
    );

  return (
    <>
      <HeaderActions>
        {nextStatus && (
          <Button onClick={() => setConfirming(true)}>Update Progress</Button>
        )}
        {isIn([Status.New, Status.Shipped, Status.Delivered]) && (
          <Button variant="outline">Create Sales Invoice</Button>
        )}
      </HeaderActions>
      <div className="h-5 w-px bg-gray-300" />
      <HeaderActions>
        {isIn([Status.New], deliveryReceipt.status) && (
          <Button variant="outline" asChild>
            <Link to={`edit`}>
              <Pencil /> Edit
            </Link>
          </Button>
        )}

        <Button variant="outline" asChild>
          <Link to={`pdf`} target="_blank">
            <Printer />
            Print
          </Link>
        </Button>
      </HeaderActions>

      {nextStatus && (
        <ConfirmDialog
          open={confirming}
          onOpenChange={setConfirming}
          title="Update Progress"
          description={`Update delivery receipt #${deliveryReceipt.id} from ${deliveryReceipt.status} to ${nextStatus}?`}
          confirmLabel={`Mark as ${nextStatus}`}
          pendingLabel="Updating..."
          isPending={isUpdating}
          onConfirm={update}
        />
      )}
    </>
  );
}

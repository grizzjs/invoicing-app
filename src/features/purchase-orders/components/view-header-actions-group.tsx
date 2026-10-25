import type { PurchaseOrderDto } from "@/api/models";
import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/ui/header-actions";
import isIn from "@/lib/is-in";
import { Link } from "@tanstack/react-router";
import { Pencil, Printer } from "lucide-react";
import Status from "../enum";

type HeaderActionsGroupProps = {
  purchaseOrder: PurchaseOrderDto;
};

export function HeaderActionsGroup({ purchaseOrder }: HeaderActionsGroupProps) {
  return (
    <>
      <HeaderActions>
        {isIn([Status.Draft], purchaseOrder.status) && (
          <Button>Finalize Order</Button>
        )}
        {isIn([Status.Finalized], purchaseOrder.status) && (
          <Button>Approve Order</Button>
        )}
        {isIn([Status.Draft, Status.Finalized], purchaseOrder.status) && (
          <Button variant="outline">Cancel Order</Button>
        )}
        {isIn([Status.Approved], purchaseOrder.status) && (
          <Button variant="outline">Create Delivery Receipt</Button>
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
    </>
  );
}

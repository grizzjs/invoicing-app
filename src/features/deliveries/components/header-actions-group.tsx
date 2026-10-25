import type { DeliveryReceiptDto } from "@/api/models";
import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/ui/header-actions";
import isIn from "@/lib/is-in";
import { Link } from "@tanstack/react-router";
import { Pencil, Printer } from "lucide-react";
import Status from "../enum";

type HeaderActionsGroupProps = {
  deliveryReceipt: DeliveryReceiptDto;
};

export function HeaderActionsGroup({
  deliveryReceipt,
}: HeaderActionsGroupProps) {
  return (
    <>
      <HeaderActions>
        {isIn([Status.New, Status.Shipped], deliveryReceipt.status) && (
          <Button>Update Progress</Button>
        )}
        {isIn([Status.New, Status.Shipped, Status.Delivered]) && (
          <Button variant="outline">Create Sales Invoice</Button>
        )}
      </HeaderActions>
      <div className="h-5 w-px bg-gray-300" />
      <HeaderActions>
        {isIn([Status.New], deliveryReceipt.status) && (
          <Button variant="outline">
            <Pencil /> Edit
          </Button>
        )}

        <Button variant="outline" asChild>
          <Link to={`pdf`} target="_blank">
            <Printer />
            Print
          </Link>
        </Button>
      </HeaderActions>
    </>
  );
}

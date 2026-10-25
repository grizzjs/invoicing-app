import type { PurchaseOrderLineItemDto } from "@/api/models";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/data-table";
import { DetailProperty } from "@/components/ui/details-card";
import { Key } from "@/components/ui/key-pair/key";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import format from "@/lib/format-money";
import { ChevronRight } from "lucide-react";
import { prop } from "ramda";
import { columns as deliveryColumns } from "../definition/line-item-deliveries";
import { columns as invoiceColumns } from "../definition/line-item-invoices";

type LineItemSheetProp = {
  lineItem: PurchaseOrderLineItemDto;
};

export function LineItemSheet({ lineItem }: LineItemSheetProp) {
  const deliveries = lineItem.deliveries.map((delivery) => {
    return {
      quantity: delivery.quantity,
      id: delivery.deliveryReceipt.id,
      status: delivery.deliveryReceipt.status,
    };
  });

  const invoices = lineItem.deliveries
    .map((delivery) => {
      return {
        totalCost: delivery.quantity * delivery.purchaseOrderLineItem.unitPrice,
        id: delivery.deliveryReceipt?.invoice?.id,
        status: delivery.deliveryReceipt?.invoice?.status,
        dueInDays: delivery.deliveryReceipt?.invoice?.dueInDays,
        createDate: delivery.deliveryReceipt?.invoice?.createDate,
      };
    })
    .filter(prop("id"));

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <ChevronRight size={15} />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-10 sm:w-10" showCloseButton={false}>
        <SheetHeader className="border border-b">
          <SheetTitle className="text-lg font-semibold">
            Order Item Details
          </SheetTitle>
        </SheetHeader>

        {/* Item Info */}
        <div className="flex flex-col px-6 gap-5">
          <DetailProperty
            header="Item"
            value={`${lineItem.name};${lineItem.description}`}
          />
          <div className="flex justify-between">
            <DetailProperty
              header="Unit Price"
              value={format(lineItem.unitPrice)}
            />
            <DetailProperty
              header="Quantity Ordered"
              value={format(lineItem.quantity)}
            />
          </div>
          <Separator />
          <Key>Delivery Progress</Key>
          <DataTable
            columns={deliveryColumns}
            data={deliveries}
            enablePagination={false}
          />
          <Key>Invoice Progress</Key>
          <DataTable
            columns={invoiceColumns}
            data={invoices}
            enablePagination={false}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}

import { useGetPurchaseOrders } from "@/api/endpoints/purchase-orders/purchase-orders";
import type { PurchaseOrderDto, PurchaseOrderLineItemDto } from "@/api/models";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup, FieldLabel } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppForm } from "@/features/common/hooks/form";
import { formOptions } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Package } from "lucide-react";
import { useState } from "react";
import z from "zod";

const schema = z.object({
  purchaseOrderId: z.number().positive(),
  customerId: z.number().positive(),
  ids: z.number().array().min(1),
});

type PurchaseOrderFormValues = z.infer<typeof schema>;

const blankValues: PurchaseOrderFormValues = {
  purchaseOrderId: 0,
  customerId: 0,
  ids: [],
};

const registerFormOpts = formOptions({
  defaultValues: blankValues,
});

const remainingQuantity = (item: PurchaseOrderLineItemDto) =>
  item.quantity -
  item.deliveries.reduce((res, current) => res + current.quantity, 0);

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // When set, this purchase order is preselected and cannot be changed.
  purchaseOrder?: PurchaseOrderDto;
}

export default function PurchaseOrderDialog({
  open,
  onOpenChange,
  purchaseOrder,
}: PurchaseOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create Delivery Receipt
          </DialogTitle>
        </DialogHeader>
        {/* Rendered inside DialogContent so the form remounts on every open,
            which re-runs onMount validation with fresh values. */}
        <PurchaseOrderForm
          purchaseOrder={purchaseOrder}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function PurchaseOrderForm({
  purchaseOrder,
  onClose,
}: {
  purchaseOrder?: PurchaseOrderDto;
  onClose: () => void;
}) {
  const { data: purchaseOrders, isLoading } = useGetPurchaseOrders(undefined, {
    query: { enabled: !purchaseOrder },
  });

  const navigate = useNavigate();
  const form = useAppForm({
    ...registerFormOpts,
    defaultValues: purchaseOrder
      ? {
          ...blankValues,
          purchaseOrderId: purchaseOrder.id,
          customerId: purchaseOrder.customer.id,
        }
      : blankValues,
    onSubmit: ({ value }) => {
      const processed = schema.parse(value);
      navigate({ to: "/deliveries/new", state: processed });
    },
    validators: {
      onMount: schema,
      onChange: schema,
    },
  });

  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<string>(
    purchaseOrder?.id.toString() ?? "",
  );

  if (isLoading) return <div>Loading...</div>;

  const selectablePurchaseOrders = purchaseOrder
    ? [purchaseOrder]
    : purchaseOrders.filter(
        (po) =>
          ["Approved", "Pending"].includes(po.status) &&
          // Hide orders whose items have all been delivered already.
          po.lineItems.some((item) => remainingQuantity(item) > 0),
      );

  const items = (
    selectedPurchaseOrder
      ? (selectablePurchaseOrders.find((po) => {
          return po.id.toString() == selectedPurchaseOrder;
        }).lineItems ?? [])
      : []
  ).filter((item) => remainingQuantity(item) > 0);

  return (
    <div className="flex flex-col gap-4 py-2">
      <form.AppForm>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="mb-6">
            <form.AppField name="purchaseOrderId">
              {(field) => {
                return (
                  <field.SelectPurchaseOrder
                    id="purchaseOrderId"
                    label="Purchase Order Number"
                    purchaseOrders={selectablePurchaseOrders}
                    disabled={!!purchaseOrder}
                    onChange={(value) => {
                      setSelectedPurchaseOrder(value.id);
                      form.setFieldValue("customerId", value.customer.id);
                      form.resetField("ids");
                    }}
                  />
                );
              }}
            </form.AppField>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <form.AppField name={`ids`}>
                  {(field) => (
                    <>
                      <FieldLabel
                        //htmlFor={id}
                        className="text-base font-medium text-right shrink-0"
                      >
                        Purchase Order Items
                      </FieldLabel>
                      {selectedPurchaseOrder && (
                        <Button
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            field.form.setFieldValue(
                              "ids",
                              items.map((i) => i.id),
                            );
                          }}
                        >
                          Select All
                        </Button>
                      )}
                    </>
                  )}
                </form.AppField>
              </div>

              {!selectedPurchaseOrder ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/40 py-10">
                  <Package className="h-7 w-7 text-muted-foreground" />
                  <p className="text-sm font-medium text-muted-foreground">
                    No Order Items
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Please select Purchase Order Number
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-72">
                  <div className="flex flex-col gap-1.5 pr-2">
                    <div>
                      {items.map((item, i) => {
                        return (
                          <form.AppField
                            name={`ids[${i}]`}
                            key={i}
                            // Toggling an item only changes ids[i], so re-run
                            // mount validation to clear the "ids" error left
                            // over from mounting with a preselected order.
                            listeners={{
                              onChange: () => form.validate("mount"),
                            }}
                          >
                            {(field) => {
                              return (
                                <field.CheckBox
                                  id={item.id}
                                  label={item.name}
                                  getLabel={() => item.name}
                                  description={`${remainingQuantity(
                                    item,
                                  )} units remaining`}
                                />
                              );
                            }}
                          </form.AppField>
                        );
                      })}
                    </div>
                  </div>
                </ScrollArea>
              )}
            </div>
          </FieldGroup>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={onClose}
                className="text-base font-medium"
                variant="outline"
              >
                Close
              </Button>
            </DialogClose>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            </form.Subscribe>
          </DialogFooter>
        </form>
      </form.AppForm>
    </div>
  );
}

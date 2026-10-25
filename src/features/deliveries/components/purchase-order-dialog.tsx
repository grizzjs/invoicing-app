import { useGetPurchaseOrders } from "@/api/endpoints/purchase-orders/purchase-orders";
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
import { formOptions, revalidateLogic } from "@tanstack/react-form";
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

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<PurchaseOrderFormValues>;
}

export default function PurchaseOrderDialog({
  open,
  onOpenChange,
}: PurchaseOrderDialogProps) {
  const { data: purchaseOrders, isLoading } = useGetPurchaseOrders();

  const navigate = useNavigate();
  const form = useAppForm({
    ...registerFormOpts,
    onSubmit: ({ value }) => {
      const processed = schema.parse(value);
      navigate({ to: "/deliveries/new", state: processed });
    },
    validators: {
      onDynamic: schema,
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
  });

  const openChange = (state: boolean) => {
    form.reset();
    setSelectedPurchaseOrder("");
    onOpenChange(state);
  };

  const [selectedPurchaseOrder, setSelectedPurchaseOrder] =
    useState<string>("");

  if (isLoading) return <div>Loading...</div>;

  const items = (
    selectedPurchaseOrder
      ? (purchaseOrders.find((po) => {
          return po.id.toString() == selectedPurchaseOrder;
        }).lineItems ?? [])
      : []
  ).filter(
    (item) =>
      item.quantity -
        item.deliveries.reduce((res, current) => res + current.quantity, 0) >
      0,
  );

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create Delivery Receipt
          </DialogTitle>
        </DialogHeader>

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
                        purchaseOrders={purchaseOrders.filter((purchaseOrder) =>
                          ["Approved", "Pending"].includes(
                            purchaseOrder.status,
                          ),
                        )}
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
                          ;
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
                              <form.AppField name={`ids[${i}]`} key={i}>
                                {(field) => {
                                  return (
                                    <field.CheckBox
                                      id={item.id}
                                      label={item.name}
                                      description={`${
                                        item.quantity -
                                        item.deliveries.reduce(
                                          (res, current) =>
                                            res + current.quantity,
                                          0,
                                        )
                                      } units remaining`}
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
                    onClick={() => onOpenChange(false)}
                    className="text-base font-medium"
                    variant="outline"
                  >
                    Close
                  </Button>
                </DialogClose>
                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <Button onClick={form.handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? "Saving..." : "Save"}
                    </Button>
                  )}
                </form.Subscribe>
              </DialogFooter>
            </form>
          </form.AppForm>
        </div>
      </DialogContent>
    </Dialog>
  );
}

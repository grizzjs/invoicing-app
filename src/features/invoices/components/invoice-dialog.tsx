import { useCreateInvoice } from "@/api/endpoints/invoices/invoices";
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
import { FieldGroup } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAppForm } from "@/features/common/hooks/form";
import { formOptions, revalidateLogic } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";

const schema = z.object({
  purchaseOrderId: z.string(),
  terms: z.string(),
  search: z.string(),
});

type PurchaseOrderFormValues = z.infer<typeof schema>;

const blankValues: PurchaseOrderFormValues = {
  purchaseOrderId: "",
  terms: "",
  search: "",
};

const registerFormOpts = formOptions({
  defaultValues: blankValues,
});

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<PurchaseOrderFormValues>;
}

export default function InvoiceDialog({
  open,
  onOpenChange,
}: InvoiceDialogProps) {
  const { data: purchaseOrders, isLoading } = useGetPurchaseOrders();
  const { mutate } = useCreateInvoice();
  const [search, setSearch] = useState("");

  const navigate = useNavigate();
  const form = useAppForm({
    ...registerFormOpts,
    onSubmit: ({ value }) => {
      const processed = schema.parse(value);
      const drs = purchaseOrders
        .find((po) => po.id.toString() === processed.purchaseOrderId)
        .deliveryReceipts.filter((dr) => dr.invoice?.status !== "Paid");
      mutate(
        {
          data: {
            createDate: new Date().toISOString(),
            dueInDays: Number(processed.terms),
            deliveryReceipts: drs.map((dr) => dr.id),
          },
        },
        {
          onSuccess: (data) => {
            navigate({ to: `/invoices/${data.id}` });
          },
        },
      );

      //navigate({ to: "/deliveries/new", state: processed });
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
    onOpenChange(state);
    setSearch("");
  };

  if (isLoading) return <div>Loading...</div>;

  const purchaseOrdersToList = purchaseOrders
    .filter(
      (po) =>
        po.id.toString().includes(search) &&
        po.deliveryReceipts.reduce(
          (res, dr) => res + (!dr.invoice ? 1 : 0),
          0,
        ) > 0,
    )
    .slice(0, 20);

  const terms = [
    { key: "0", value: "Cash" },
    { key: "15", value: "15 days" },
    { key: "30", value: "30 days" },
    { key: "60", value: "60 days" },
    { key: "90", value: "90 days" },
  ];

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create Sales Invoice
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
                <form.AppField name="terms">
                  {(field) => {
                    return (
                      <field.Select
                        id="purchaseOrderId"
                        label="Payment Terms"
                        entities={terms}
                      />
                    );
                  }}
                </form.AppField>
                <form.AppField name="search">
                  {(field) => {
                    return (
                      <field.TextInput
                        id="search"
                        label="Documents"
                        onChange={(value) => {
                          setSearch(value);
                        }}
                      />
                    );
                  }}
                </form.AppField>

                <ScrollArea className="h-72">
                  <div className="flex flex-col gap-1.5 pr-2">
                    <form.AppField name="purchaseOrderId">
                      {(field) => {
                        return (
                          <field.Radio
                            label="Documents"
                            entities={search ? purchaseOrdersToList : []}
                            getLabel={(po) => (
                              <div className="flex flex-1 items-center gap-3 min-w-0 text-sm">
                                <span className="font-semibold w-28 shrink-0">
                                  {po.id}
                                </span>
                                <span className="flex-1 truncate text-muted-foreground">
                                  {po.customer.name}
                                </span>
                                <span className="shrink-0 text-muted-foreground whitespace-nowrap">
                                  {
                                    po.deliveryReceipts?.filter(
                                      (dr) => !dr.invoice,
                                    ).length
                                  }{" "}
                                  Delivery Receipt(s)
                                </span>
                              </div>
                            )}
                          />
                        );
                      }}
                    </form.AppField>
                  </div>
                </ScrollArea>
                {/* <div className="flex flex-col gap-2">
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
                </div> */}
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

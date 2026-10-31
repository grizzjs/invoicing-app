import { useGetCustomer } from "@/api/endpoints/customers/customers";
import { useCreateDeliveryReceipt } from "@/api/endpoints/delivery-receipts/delivery-receipts";
import { useGetPurchaseOrder } from "@/api/endpoints/purchase-orders/purchase-orders";
import type { CustomerDto, PurchaseOrderLineItemDto } from "@/api/models";
import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Header } from "@/components/ui/header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppForm } from "@/features/common/hooks/form";
import formatPhoneNumber from "@/features/customers/lib/formatPhoneNumber";
import {
  PHONE_MAX_LENGTH,
  phoneNumberSchema,
} from "@/features/customers/lib/phoneNumberSchema";
import { today } from "@/lib/date-utils";
import { formatDate } from "@/lib/format-date";
import { formOptions } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Plus, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import { useEffect } from "react";
import z from "zod";

declare module "@tanstack/react-router" {
  interface HistoryState {
    customerId?: number;
    ids?: number[];
    purchaseOrderId?: number;
  }
}

const schema = z.object({
  customer: z.string().min(1, "Customer is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: phoneNumberSchema,
  email: z.string().email("Invalid email address"),
  tin: z.string().regex(/^\d{3}-\d{3}-\d{3}-\d{5}$/, {
    message: "TIN must follow the format: XXX-XXX-XXX-XXXXX",
  }),
  lineItems: z
    .object({
      id: z.number(),
      orderedQuantity: z.number(),
      remainingQuantity: z.number(),
      deliveryQuantity: z
        .number()
        .positive({ message: "Quantity to deliver must be positive" }),
    })
    .refine((data) => data.deliveryQuantity <= Number(data.remainingQuantity), {
      message: "Quantity to deliver must be less than the remaining quantity.",
      path: ["deliveryQuantity"],
    })
    .array()
    .min(1),
});

type CustomerFormValues = z.infer<typeof schema>;

const blankValues: CustomerFormValues = {
  customer: "",
  address: "",
  phoneNumber: "",
  email: "",
  lineItems: [],
  tin: "",
};

const registerFormOpts = formOptions({
  defaultValues: blankValues,
});

const mapLineItems = (lineItem) => {
  return {
    id: lineItem.id,
    name: lineItem.name,
    orderedQuantity: lineItem.quantity,
    remainingQuantity:
      lineItem.quantity -
      lineItem.deliveries.reduce((result, current) => {
        return result + current.quantity;
      }, 0),
    deliveryQuantity: 0,
  };
};

const setInitialFormValues = (
  form,
  customer: CustomerDto,
  ids: number[],
  purchaseOrderLineItems: PurchaseOrderLineItemDto[],
) => {
  form.setFieldValue("customer", customer.name);
  form.setFieldValue("address", customer.address);
  form.setFieldValue("tin", customer.tin);
  form.setFieldValue("phoneNumber", customer.phoneNumber);
  form.setFieldValue("email", customer.email);

  const lineItems = purchaseOrderLineItems
    .filter((lineItem) => ids.includes(lineItem.id))
    .map(mapLineItems);

  //console.log(lineItems);

  form.setFieldValue("lineItems", lineItems);
};

export default function CreateDeliveryPage() {
  const { customerId, ids, purchaseOrderId } = useRouterState({
    select: (s) =>
      s.location.state as unknown as {
        customerId: number;
        ids: number[];
        purchaseOrderId: number;
      },
  });

  const { data: customer, isLoading: isCustomerLoading } =
    useGetCustomer(customerId);
  const { data: purchaseOrder, isLoading: isPurchaseOrder } =
    useGetPurchaseOrder(purchaseOrderId);

  const { mutate } = useCreateDeliveryReceipt();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useAppForm({
    ...registerFormOpts,
    onSubmit: ({ value }) => {
      const processed = schema.parse(value);
      console.log(processed);
      mutate(
        {
          data: {
            purchaseOrder: {
              id: purchaseOrderId,
            },
            createDate: new Date().toISOString(),
            lineItems: processed.lineItems.map((li) => ({
              quantity: li.deliveryQuantity,
              purchaseOrderLineItem: {
                id: li.id,
              },
            })),
          },
        },
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/deliveries"] });
            navigate({ to: `/deliveries/${data.id}` });
          },
        },
      );
    },
    validators: {
      onMount: schema,
      onChange: schema,
    },
  });

  useEffect(() => {
    if (!customer || !purchaseOrder) return;
    setInitialFormValues(form, customer, ids, purchaseOrder.lineItems);
  }, [customer, purchaseOrder]);

  if (isCustomerLoading || isPurchaseOrder) return <div>"Loading..."</div>;

  const allLineItems = purchaseOrder.lineItems
    .map(mapLineItems)
    .filter((li) => li.remainingQuantity > 0);

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Deliveries" action="Create"></Header>

      <form.AppForm>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-6 px-6 mb-6">
            <FieldSet className="grid grid-cols-2 gap-6 pb-3">
              <div className="col-span-1 text-base font-medium">
                <div className="flex gap-6">
                  <FieldLabel className="text-base font-medium">
                    Purchase Order Number
                  </FieldLabel>
                  <FieldLabel
                    className="text-base font-medium  text-gray-400"
                    asChild
                  >
                    <Link to={`/purchase-orders/${`1`}`} target="_blank">
                      {1}{" "}
                      <SquareArrowOutUpRight className="h-4 w-4 text-gray-500" />
                    </Link>
                  </FieldLabel>
                </div>
              </div>
              <div className="col-span-1 text-base font-medium">
                <div className="flex gap-6">
                  <FieldLabel className="text-base font-medium">
                    Date created
                  </FieldLabel>
                  <FieldLabel className="text-base font-medium  text-gray-400">
                    {formatDate(today())}
                  </FieldLabel>
                </div>
              </div>
            </FieldSet>
            <FieldSet className="pb-6">
              <h2 className="text-xs font-normal text-gray-400">
                Customer Details
              </h2>
              <div className="grid grid-cols-1 gap-5">
                {/* Name dropdown */}
                <div className="grid grid-cols-2 gap-10">
                  <form.AppField name="customer">
                    {(field) => {
                      return (
                        <field.TextInput
                          id="customer"
                          label="Name"
                          orientation="horizontal"
                          className="flex items-center gap-5"
                          disabled={true}
                          initialValue={customer.name}
                        />
                      );
                    }}
                  </form.AppField>
                </div>

                {/* Address & Phone */}
                <div className="grid grid-cols-2 gap-10">
                  <form.AppField name="address">
                    {(field) => {
                      return (
                        <field.TextInput
                          id="address"
                          label="Address"
                          orientation="horizontal"
                          className="flex items-center gap-5"
                        />
                      );
                    }}
                  </form.AppField>

                  <form.AppField name="phoneNumber">
                    {(field) => {
                      return (
                        <field.TextInput
                          id="phoneNumber"
                          label="Phone "
                          orientation="horizontal"
                          className="flex items-center gap-5"
                          format={formatPhoneNumber}
                          maxLength={PHONE_MAX_LENGTH}
                        />
                      );
                    }}
                  </form.AppField>
                </div>

                {/* TIN & Email */}
                <div className="grid grid-cols-2 gap-10">
                  <form.AppField name="tin">
                    {(field) => {
                      return (
                        <field.TextInput
                          id="tin"
                          label="TIN"
                          orientation="horizontal"
                          className="flex items-end gap-5"
                          disabled={true}
                        />
                      );
                    }}
                  </form.AppField>

                  <form.AppField name="email">
                    {(field) => {
                      return (
                        <field.TextInput
                          id="email"
                          label="Email"
                          orientation="horizontal"
                          className="flex items-center gap-5"
                          disabled={true}
                        />
                      );
                    }}
                  </form.AppField>
                </div>
              </div>
            </FieldSet>
            <FieldSet className="grid grid-cols-1 gap-6">
              <section>
                <h2 className="text-xs font-normal text-gray-400 mb-5">
                  Order Items
                </h2>

                <form.Field name="lineItems" mode="array">
                  {(field) => (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[45%]">Item</TableHead>
                            <TableHead className="w-[15%]">
                              Ordered Quantity
                            </TableHead>
                            <TableHead className="w-[15%]">
                              Remaining Quantity
                            </TableHead>
                            <TableHead className="w-[20%]">
                              Quantity to Deliver
                            </TableHead>
                            <TableHead className="w-[5%]" />
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {field.state.value.map((_, idx) => (
                            <TableRow
                              key={idx}
                              className={
                                idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                              }
                            >
                              <TableCell>
                                <form.AppField name={`lineItems[${idx}].id`}>
                                  {(field) => {
                                    return (
                                      <field.SelectLineItem
                                        id={`lineItems[${idx}].id`}
                                        label="Name"
                                        orientation="horizontal"
                                        className="flex items-center gap-5"
                                        lineItems={allLineItems.filter(
                                          (li) =>
                                            // allow current row's selection + exclude others
                                            li.id ===
                                              field.form.getFieldValue(
                                                `lineItems[${idx}].id`,
                                              ) ||
                                            !field.form
                                              .getFieldValue("lineItems")
                                              .some((row) => row.id === li.id),
                                        )}
                                        hideLabel={true}
                                        onChange={(lineItem) => {
                                          field.form.setFieldValue(
                                            `lineItems[${idx}].orderedQuantity`,
                                            lineItem.orderedQuantity,
                                          );
                                          field.form.setFieldValue(
                                            `lineItems[${idx}].remainingQuantity`,
                                            lineItem.remainingQuantity,
                                          );
                                          field.form.setFieldValue(
                                            `lineItems[${idx}].deliveryQuantity`,
                                            0,
                                          );
                                        }}
                                      />
                                    );
                                  }}
                                </form.AppField>
                              </TableCell>
                              <TableCell>
                                <form.AppField
                                  name={`lineItems[${idx}].orderedQuantity`}
                                >
                                  {(field) => {
                                    return (
                                      <field.TextInput
                                        id={`lineItems[${idx}].orderedQuantity`}
                                        label=""
                                        orientation="horizontal"
                                        className="flex items-center gap-5"
                                        hideLabel={true}
                                        disabled={true}
                                      />
                                    );
                                  }}
                                </form.AppField>
                              </TableCell>
                              <TableCell>
                                <form.AppField
                                  name={`lineItems[${idx}].remainingQuantity`}
                                >
                                  {(field) => {
                                    return (
                                      <field.TextInput
                                        id={`lineItems[${idx}].remainingQuantity`}
                                        label=""
                                        type="number"
                                        orientation="horizontal"
                                        className="flex items-center gap-5"
                                        hideLabel={true}
                                        disabled={true}
                                      />
                                    );
                                  }}
                                </form.AppField>
                              </TableCell>
                              <TableCell>
                                <form.AppField
                                  name={`lineItems[${idx}].deliveryQuantity`}
                                >
                                  {(field) => {
                                    return (
                                      <field.TextInput
                                        id={`lineItems[${idx}].deliveryQuantity`}
                                        label=""
                                        type="number"
                                        orientation="horizontal"
                                        className="flex items-center gap-5"
                                        hideLabel={true}
                                      />
                                    );
                                  }}
                                </form.AppField>
                              </TableCell>
                              <TableCell className="text-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={field.state.value.length === 1}
                                  onClick={() => field.removeValue(idx)}
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>

                      <div className="px-4 py-3 bg-white">
                        {field.form.getFieldValue("lineItems").length <
                          allLineItems.length && (
                          <Button
                            variant="ghost"
                            onClick={() => {
                              const unselectedItems = allLineItems.filter(
                                (li) =>
                                  !field.state.value
                                    .map((i) => i.id)
                                    .includes(li.id),
                              );
                              field.pushValue(unselectedItems[0]);
                            }}
                            className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition"
                          >
                            <Plus />
                            Add row
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </form.Field>
              </section>
            </FieldSet>
          </FieldGroup>
          <div className="flex justify-end gap-3 pt-2 px-6 mb-6 ">
            <Button variant="outline" asChild>
              <Link to="/deliveries">Cancel</Link>
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit}>
                  {isSubmitting ? "Saving..." : "Save"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </form.AppForm>
    </main>
  );
}

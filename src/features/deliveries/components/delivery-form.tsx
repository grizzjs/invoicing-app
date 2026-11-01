import { Button } from "@/components/ui/button";
import { FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  SupportingDocumentsSection,
  useSupportingDocuments,
} from "@/features/common/components/supporting-documents";
import { useAppForm } from "@/features/common/hooks/form";
import formatPhoneNumber from "@/features/customers/lib/formatPhoneNumber";
import {
  PHONE_MAX_LENGTH,
  phoneNumberSchema,
} from "@/features/customers/lib/phoneNumberSchema";
import { formatDate } from "@/lib/format-date";
import { Link } from "@tanstack/react-router";
import { Plus, SquareArrowOutUpRight, Trash2 } from "lucide-react";
import type { DateTime } from "luxon";
import z from "zod";

const deliverySchema = z.object({
  customer: z.string().min(1, "Customer is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: phoneNumberSchema,
  email: z.string().email("Invalid email address"),
  tin: z.string().regex(/^\d{3}-\d{3}-\d{3}-\d{5}$/, {
    message: "TIN must follow the format: XXX-XXX-XXX-XXXXX",
  }),
  lineItems: z
    .object({
      // Purchase order line item being delivered.
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

export type DeliveryFormValues = z.infer<typeof deliverySchema>;

export type LineItemOption = DeliveryFormValues["lineItems"][number] & {
  name: string;
};

type DeliveryFormProps = {
  purchaseOrderId: number;
  createDate: DateTime | string;
  // Purchase order line items that can still be delivered.
  lineItemOptions: LineItemOption[];
  defaultValues: DeliveryFormValues;
  cancelTo: string;
  existingFiles?: string[];
  onSubmit: (
    values: DeliveryFormValues,
    files: File[],
  ) => Promise<unknown> | void;
};

export default function DeliveryForm({
  purchaseOrderId,
  createDate,
  lineItemOptions,
  defaultValues,
  cancelTo,
  existingFiles = [],
  onSubmit,
}: DeliveryFormProps) {
  const docs = useSupportingDocuments(existingFiles);

  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) =>
      onSubmit(deliverySchema.parse(value), docs.getFiles()),
    validators: {
      onMount: deliverySchema,
      onChange: deliverySchema,
    },
  });

  return (
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
                  <Link
                    to={`/purchase-orders/${purchaseOrderId}`}
                    target="_blank"
                  >
                    {purchaseOrderId}{" "}
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
                  {formatDate(createDate)}
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
                                {(field) => (
                                  // Subscribe to every row so this dropdown
                                  // re-renders when another row's item changes;
                                  // the field alone only tracks its own value.
                                  <form.Subscribe
                                    selector={(state) => state.values.lineItems}
                                  >
                                    {(rows) => (
                                      <field.SelectLineItem
                                        id={`lineItems[${idx}].id`}
                                        label="Name"
                                        orientation="horizontal"
                                        className="flex items-center gap-5"
                                        lineItems={lineItemOptions.filter(
                                          (li) =>
                                            // allow current row's selection + exclude others
                                            li.id === field.state.value ||
                                            !rows.some(
                                              (row) => row.id === li.id,
                                            ),
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
                                    )}
                                  </form.Subscribe>
                                )}
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
                        lineItemOptions.length && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            const unselectedItems = lineItemOptions.filter(
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
          <FieldSet className="grid grid-cols-1 gap-4">
            <SupportingDocumentsSection {...docs} />
          </FieldSet>
        </FieldGroup>
        <div className="flex justify-end gap-3 pt-2 px-6 mb-6 ">
          <Button variant="outline" asChild>
            <Link to={cancelTo}>Cancel</Link>
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
  );
}

import type { CustomerDto } from "@/api/models";
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
import { useAppForm } from "@/features/common/hooks/form";
import formatPhoneNumber from "@/features/customers/lib/formatPhoneNumber";
import { formatDate } from "@/lib/format-date";
import { Link } from "@tanstack/react-router";
import { FileText, Trash2 } from "lucide-react";
import type { DateTime } from "luxon";
import { useRef, useState } from "react";
import z from "zod";

const purchaseOrderSchema = z.object({
  customer: z.object({ id: z.number() }, "Customer is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  tin: z.string().regex(/^\d{3}-\d{3}-\d{3}-\d{5}$/, {
    message: "TIN must follow the format: XXX-XXX-XXX-XXXXX",
  }),
  lineItems: z
    .object({
      // Set for line items that already exist on the purchase order.
      id: z.number().optional(),
      name: z.string().min(1, "Item name is required"),
      description: z.string().optional(),
      quantity: z
        .number()
        .positive({ message: "Item quantity must be positive" }),
      unitPrice: z
        .number()
        .positive({ message: "Item price must be positive" }),
    })
    .array()
    .min(1),
});

export type PurchaseOrderFormValues = z.infer<typeof purchaseOrderSchema>;

const blankValues: PurchaseOrderFormValues = {
  customer: {
    id: -1,
  },
  address: "",
  phoneNumber: "",
  email: "",
  lineItems: [{ name: "", description: "", quantity: 1, unitPrice: 1 }],
  tin: "",
};

type PurchaseOrderFormProps = {
  customers: CustomerDto[];
  createDate: DateTime | string;
  defaultValues?: PurchaseOrderFormValues;
  // Editing keeps the purchase order's customer.
  lockCustomer?: boolean;
  cancelTo: string;
  existingFiles?: string[];
  onSubmit: (values: PurchaseOrderFormValues, files: File[]) => Promise<unknown> | void;
};

function basename(key: string) {
  return key.split("/").pop() ?? key;
}

export default function PurchaseOrderForm({
  customers,
  createDate,
  defaultValues = blankValues,
  lockCustomer = false,
  cancelTo,
  existingFiles = [],
  onSubmit,
}: PurchaseOrderFormProps) {
  const [fileEntries, setFileEntries] = useState<Array<File | null>>([null]);
  const fileInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  const addFileEntry = () => setFileEntries((prev) => [...prev, null]);

  const removeFileEntry = (idx: number) => {
    setFileEntries((prev) => prev.filter((_, i) => i !== idx));
    fileInputRefs.current = fileInputRefs.current.filter((_, i) => i !== idx);
  };

  const handleFileChange = (idx: number, file: File | null) => {
    setFileEntries((prev) => prev.map((f, i) => (i === idx ? file : f)));
  };

  const form = useAppForm({
    defaultValues,
    onSubmit: ({ value }) => {
      const selectedFiles = fileEntries.filter((f): f is File => f !== null);
      return onSubmit(purchaseOrderSchema.parse(value), selectedFiles);
    },
    validators: {
      onMount: purchaseOrderSchema,
      onChange: purchaseOrderSchema,
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
          <FieldSet className="grid grid-cols-2 gap-6">
            <div className="col-span-1 pl-10"></div>
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
                      <field.SelectCustomer
                        id="customer"
                        label="Customer"
                        orientation="horizontal"
                        className="flex items-center gap-5"
                        customers={customers}
                        disabled={lockCustomer}
                        onChange={(value: CustomerDto) => {
                          field.form.setFieldValue("address", value.address);
                          field.form.setFieldValue(
                            "phoneNumber",
                            value.phoneNumber,
                          );
                          field.form.setFieldValue("tin", value.tin);
                          field.form.setFieldValue("email", value.email);
                        }}
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
                        disabled={true}
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
                        disabled={true}
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
                          <TableHead className="w-[20%]">Item</TableHead>
                          <TableHead className="w-[35%]">Description</TableHead>
                          <TableHead className="w-[20%]">Quantity</TableHead>
                          <TableHead className="w-[20%]">Unit Price</TableHead>
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
                              <form.AppField name={`lineItems[${idx}].name`}>
                                {(field) => {
                                  return (
                                    <field.TextInput
                                      id={`lineItems[${idx}].name`}
                                      label=""
                                      orientation="horizontal"
                                      className="flex items-center gap-5"
                                      hideLabel={true}
                                    />
                                  );
                                }}
                              </form.AppField>
                            </TableCell>
                            <TableCell>
                              <form.AppField
                                name={`lineItems[${idx}].description`}
                              >
                                {(field) => {
                                  return (
                                    <field.TextInput
                                      id={`lineItems[${idx}].description`}
                                      label=""
                                      orientation="horizontal"
                                      className="flex items-center gap-5"
                                      hideLabel={true}
                                    />
                                  );
                                }}
                              </form.AppField>
                            </TableCell>
                            <TableCell>
                              <form.AppField
                                name={`lineItems[${idx}].quantity`}
                              >
                                {(field) => {
                                  return (
                                    <field.TextInput
                                      id={`lineItems[${idx}].quantity`}
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
                            <TableCell>
                              <form.AppField
                                name={`lineItems[${idx}].unitPrice`}
                              >
                                {(field) => {
                                  return (
                                    <field.TextInput
                                      id={`lineItems[${idx}].unitPrice`}
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
                      <button
                        type="button"
                        onClick={() =>
                          field.pushValue({
                            name: "",
                            description: "",
                            quantity: 1,
                            unitPrice: 1.5,
                          })
                        }
                        className="flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                        Add row
                      </button>
                    </div>
                  </div>
                )}
              </form.Field>
            </section>
          </FieldSet>
          <FieldSet className="grid grid-cols-1 gap-4">
            <section>
              <h2 className="text-xs font-normal text-gray-400 mb-4">
                Supporting Documents
              </h2>
              <div className="flex flex-col gap-3">
                {/* Existing uploaded files — read-only */}
                {existingFiles.map((key) => (
                  <div
                    key={key}
                    className="flex items-center gap-3 border border-gray-200 rounded-lg px-3 py-2"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="flex-1 text-sm text-gray-700 truncate">
                      {basename(key)}
                    </span>
                  </div>
                ))}
                {/* New file inputs */}
                {fileEntries.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <input
                      ref={(el) => {
                        fileInputRefs.current[idx] = el;
                      }}
                      type="file"
                      className="flex-1 block w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-3 py-2 cursor-pointer file:mr-3 file:py-0.5 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                      onChange={(e) =>
                        handleFileChange(idx, e.target.files?.[0] ?? null)
                      }
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFileEntry(idx)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addFileEntry}
                className="mt-3 flex items-center gap-2 text-sm font-medium text-gray-800 hover:text-gray-900 transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add file
              </button>
            </section>
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

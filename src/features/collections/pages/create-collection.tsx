import { useCreateCollection } from "@/api/endpoints/collections/collections";
import { useGetCustomers } from "@/api/endpoints/customers/customers";
import { useGetInvoices } from "@/api/endpoints/invoices/invoices";
import type { CustomerDto } from "@/api/models";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { today } from "@/lib/date-utils";
import { formatDate } from "@/lib/format-date";
import format from "@/lib/format-money";
import { parseDateFromISO } from "@/lib/parse-date";
import { formOptions } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { CircleAlert, Trash2 } from "lucide-react";
import { useState } from "react";
import z from "zod";
import InvoiceDialog from "../components/invoice-dialog";
import SelectCustomerDialog from "../components/select-customer-dialog";

const schema = z.object({
  customer: z.object({ id: z.number() }, "Customer is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  tin: z.string().regex(/^\d{3}-\d{3}-\d{3}-\d{5}$/, {
    message: "TIN must follow the format: XXX-XXX-XXX-XXXXX",
  }),
  amount: z.number().positive(),
  tax: z.number(),
  notes: z.string(),
  invoices: z
    .object({
      id: z.number().min(1, "Invoice id is required"),
    })
    .array()
    .min(1, "Add at least one invoice"),
});

type CollectionFormValues = z.infer<typeof schema>;

const blankValues: CollectionFormValues = {
  customer: {
    id: -1,
  },
  address: "",
  phoneNumber: "",
  email: "",
  invoices: [],
  tin: "",
  amount: 0,
  tax: 0,
  notes: "",
};

const registerFormOpts = formOptions({
  defaultValues: blankValues,
});

const FALLBACK_ERROR = "Something went wrong while saving. Please try again.";

// NestJS errors carry `message` as a string, or as a list of validation errors.
function getErrorMessage(error: unknown) {
  if (!isAxiosError(error)) return FALLBACK_ERROR;
  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message.join(", ");
  return typeof message === "string" && message ? message : FALLBACK_ERROR;
}

export default function CreateCollectionPage() {
  const { data: customers, isLoading: isLoadingCustomers } = useGetCustomers();
  const { data: invoices, isLoading: isLoadingInvoices } = useGetInvoices();
  const isLoading = isLoadingCustomers || isLoadingInvoices;

  const [open, setOpen] = useState(false);
  const [customerRequired, setCustomerRequired] = useState(false);

  const { mutate, isPending, isError, error } = useCreateCollection();

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const form = useAppForm({
    ...registerFormOpts,
    onSubmit: ({ value }) => {
      const processed = schema.parse(value);
      mutate(
        {
          data: {
            createDate: new Date().toISOString(),
            amount: processed.amount,
            vat: processed.tax,
            notes: processed.notes,
            customer: processed.customer.id,
            invoices: processed.invoices.map((invoice) => invoice.id),
          },
        },
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/collections"] });
            navigate({ to: `/collections/${data.id}` });
          },
        },
      );
    },
    validators: {
      onMount: schema,
      onChange: schema,
    },
  });

  if (isLoading) return <div>"Loading..."</div>;

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Collections" action="Create"></Header>
      <form.Subscribe
        selector={(state) => [state.values.customer, state.values.invoices]}
      >
        {([customerValue, addedInvoices]) => {
          const selectedCustomer = customers.find(
            (customer) => customer.id === (customerValue as { id: number }).id,
          );
          return (
            <>
              <SelectCustomerDialog
                open={customerRequired}
                onOpenChange={setCustomerRequired}
              />
              {selectedCustomer && (
                <InvoiceDialog
                  open={open}
                  onOpenChange={setOpen}
                  customer={selectedCustomer}
                  excludedIds={(addedInvoices as { id: number }[]).map(
                    (invoice) => invoice.id,
                  )}
                  onAdd={(ids) =>
                    ids.forEach((id) => form.pushFieldValue("invoices", { id }))
                  }
                />
              )}
            </>
          );
        }}
      </form.Subscribe>
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
                        <field.SelectCustomer
                          id="customer"
                          label="Customer"
                          orientation="horizontal"
                          className="flex items-center gap-5"
                          customers={customers}
                          onChange={(value: CustomerDto) => {
                            // Invoices belong to the previous customer.
                            field.form.setFieldValue("invoices", []);
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
            <FieldSet>
              <h2 className="text-xs font-normal text-gray-400 mb-5">
                Details
              </h2>

              <div className="grid grid-cols-2 gap-10">
                <div className="grid grid-cols-1 gap-5">
                  <form.AppField name="amount">
                    {(field) => {
                      return (
                        <field.TextInput
                          id="amount"
                          label="Amount"
                          orientation="horizontal"
                          className="flex items-end gap-5"
                          type="number"
                        />
                      );
                    }}
                  </form.AppField>

                  <form.AppField name="tax">
                    {(field) => {
                      return (
                        <field.TextInput
                          id="tax"
                          label="WHT (%)"
                          orientation="horizontal"
                          className="flex items-center gap-5"
                          type="number"
                        />
                      );
                    }}
                  </form.AppField>
                </div>
                <div className="grid grid-cols-1 gap-5">
                  <form.AppField name="notes">
                    {(field) => {
                      return (
                        <field.TextArea
                          id="notes"
                          label="Notes"
                          type="text"
                          orientation="horizontal"
                          className="flex items-center gap-5"
                        />
                      );
                    }}
                  </form.AppField>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 ">
                <form.Field name="invoices" mode="array">
                  {(field) => (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="w-[15%]">
                              Invoice Number
                            </TableHead>
                            <TableHead className="w-[15%]">
                              Date Created
                            </TableHead>
                            <TableHead className="w-[15%]">
                              Payment Terms
                            </TableHead>
                            <TableHead className="w-[25%]">Due Date</TableHead>
                            <TableHead className="w-[25%]">Amount</TableHead>
                            <TableHead className="w-[5%]" />
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {field.state.value.map((row, idx) => {
                            const invoice = invoices.find(
                              (i) => i.id === row.id,
                            );
                            const createDate = invoice
                              ? parseDateFromISO(invoice.createDate)
                              : undefined;
                            return (
                              <TableRow
                                key={row.id}
                                className={
                                  idx % 2 === 0
                                    ? "bg-background"
                                    : "bg-muted/20"
                                }
                              >
                                <TableCell>{row.id}</TableCell>
                                <TableCell>
                                  {createDate && formatDate(createDate)}
                                </TableCell>
                                <TableCell>
                                  {invoice && `${invoice.dueInDays} days`}
                                </TableCell>
                                <TableCell>
                                  {createDate &&
                                    formatDate(
                                      createDate.plus({
                                        days: invoice.dueInDays,
                                      }),
                                    )}
                                </TableCell>
                                <TableCell>
                                  {invoice && format(invoice.amount)}
                                </TableCell>
                                <TableCell className="text-center">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => field.removeValue(idx)}
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>

                      <div className="px-4 py-3 bg-white">
                        <button
                          type="button"
                          onClick={() => {
                            const hasCustomer = customers.some(
                              (customer) =>
                                customer.id ===
                                form.getFieldValue("customer")?.id,
                            );
                            if (hasCustomer) setOpen(true);
                            else setCustomerRequired(true);
                          }}
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
              </div>
            </FieldSet>
          </FieldGroup>
          {isError && (
            <div className="px-6 mb-4">
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Unable to save collection</AlertTitle>
                <AlertDescription>{getErrorMessage(error)}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2 px-6 mb-6 ">
            <Button variant="outline" asChild>
              <Link to="/collections">Cancel</Link>
            </Button>
            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Button type="submit" disabled={!canSubmit || isPending}>
                  {isSubmitting || isPending ? "Saving..." : "Save"}
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </form.AppForm>
    </main>
  );
}

import { useGetCustomers } from "@/api/endpoints/customers/customers";
import { useCreatePurchaseOrder } from "@/api/endpoints/purchase-orders/purchase-orders";
import type { CustomerDto } from "@/api/models";
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
import { formOptions, revalidateLogic, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { Trash2 } from "lucide-react";
import z from "zod";
import { ValidationErrorBanner } from "../../common/components/validation-banner";

const schema = z.object({
  customer: z.object({ id: z.number() }, "Customer is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  tin: z.string().regex(/^\d{3}-\d{3}-\d{3}-\d{4}$/, {
    message: "TIN must follow the format: XXX-XXX-XXX-XXXXX",
  }),
  lineItems: z
    .object({
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

type CustomerFormValues = z.infer<typeof schema>;

const blankValues: CustomerFormValues = {
  customer: {
    id: -1,
  },
  address: "",
  phoneNumber: "",
  email: "",
  lineItems: [{ name: "", description: "", quantity: 1, unitPrice: 1 }],
  tin: "",
};

const registerFormOpts = formOptions({
  defaultValues: blankValues,
});

export default function CreatePurchaseOrderPage() {
  const { data: customers, isLoading } = useGetCustomers();
  const { mutate } = useCreatePurchaseOrder();

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
            customer: {
              id: processed.customer.id,
            },
            status: "Finalized",
            createDate: new Date().toISOString(),
            lineItems: processed.lineItems,
          },
        },
        {
          onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["/purchase-orders"] });
            navigate({ to: `/purchase-orders/${data.id}` });
          },
        },
      );
    },
    validators: {
      onDynamic: schema,
    },
    validationLogic: revalidateLogic({
      mode: "submit",
      modeAfterSubmission: "blur",
    }),
  });

  const errorMap = useStore(form.store, (state) => state.errorMap);

  if (isLoading) return <div>"Loading..."</div>;

  return (
    <main className="flex flex-1 flex-col overflow-auto gap-4">
      <Header title="Purchase Orders" action="Create"></Header>

      <form.AppForm>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="gap-6 px-6 mb-6">
            <ValidationErrorBanner errorMap={errorMap} />
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
                          hideError={true}
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
                          hideError={true}
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
                          hideError={true}
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
                          hideError={true}
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
                            <TableHead className="w-[35%]">
                              Description
                            </TableHead>
                            <TableHead className="w-[20%]">Quantity</TableHead>
                            <TableHead className="w-[20%]">
                              Unit Price
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
                                <form.AppField name={`lineItems[${idx}].name`}>
                                  {(field) => {
                                    return (
                                      <field.TextInput
                                        id={`lineItems[${idx}].name`}
                                        label=""
                                        orientation="horizontal"
                                        className="flex items-center gap-5"
                                        hideLabel={true}
                                        hideError={true}
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
                                        hideError={true}
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
                                        hideError={true}
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
                                        hideError={true}
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
          </FieldGroup>
          <div className="flex justify-end gap-3 pt-2 px-6 mb-6 ">
            <Button variant="outline" asChild>
              <Link to="/purchase-orders">Cancel</Link>
            </Button>
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <Button onClick={form.handleSubmit} disabled={isSubmitting}>
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

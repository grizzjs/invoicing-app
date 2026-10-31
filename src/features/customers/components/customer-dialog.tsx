import {
  getGetCustomerQueryKey,
  useCreateCustomer,
  useUpdateCustomer,
} from "@/api/endpoints/customers/customers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldError, FieldGroup } from "@/components/ui/field";
import { useAppForm } from "@/features/common/hooks/form";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import z from "zod";
import formatPhoneNumber from "../lib/formatPhoneNumber";
import formatTin from "../lib/formatTIN";

// Lengths of a fully formatted value: "(917) 517 9241" and "XXX-XXX-XXX-XXXXX".
const PHONE_MAX_LENGTH = 14;
const TIN_MAX_LENGTH = 17;

const countDigits = (value: string) => value.replace(/\D/g, "").length;

// Digits are counted on the raw value so extra digits hidden by the input
// formatter still fail validation instead of being silently dropped on save.
const schema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  address: z.string().trim().min(1, "Address is required"),
  phoneNumber: z
    .string()
    .min(1, { message: "Phone number is required", abort: true })
    .refine((value) => countDigits(value) === 10, {
      message: "Phone number must be 10 digits",
    })
    .transform(formatPhoneNumber),
  email: z
    .string()
    .trim()
    .min(1, { message: "Email is required", abort: true })
    .email("Invalid email address"),
  tin: z
    .string()
    .min(1, { message: "TIN is required", abort: true })
    .refine((value) => countDigits(value) === 14, {
      message: "TIN must follow the format: XXX-XXX-XXX-XXXXX",
    })
    .transform(formatTin),
});

type CustomerFormValues = z.input<typeof schema>;

const blankValues: CustomerFormValues = {
  name: "",
  address: "",
  phoneNumber: "",
  email: "",
  tin: "",
};

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerFormValues & { id: number };
}

export default function CustomerDialog({
  open,
  onOpenChange,
  customer,
}: CustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {customer ? "Edit Customer" : "Create Customer"}
          </DialogTitle>
        </DialogHeader>
        {/* Rendered inside DialogContent so the form remounts on every open,
            which re-runs onMount validation with fresh values. */}
        <CustomerForm customer={customer} onSaved={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

interface CustomerFormProps {
  customer?: CustomerDialogProps["customer"];
  onSaved: () => void;
}

function CustomerForm({ customer, onSaved }: CustomerFormProps) {
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const { mutateAsync: createCustomer } = useCreateCustomer();
  const { mutateAsync: updateCustomer } = useUpdateCustomer();

  const form = useAppForm({
    defaultValues: customer
      ? {
          name: customer.name,
          address: customer.address,
          phoneNumber: customer.phoneNumber,
          email: customer.email,
          tin: customer.tin,
        }
      : blankValues,
    onSubmit: async ({ value }) => {
      const data = schema.parse(value);
      setSubmitError(null);
      try {
        if (customer) {
          await updateCustomer({ id: customer.id, data });
        } else {
          await createCustomer({ data });
        }
      } catch {
        setSubmitError("Failed to save customer. Please try again.");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["/customers"] });
      if (customer) {
        queryClient.invalidateQueries({
          queryKey: getGetCustomerQueryKey(customer.id),
        });
      }
      onSaved();
    },
    validators: {
      onMount: schema,
      onChange: schema,
    },
  });

  // Saved data may already be invalid, so Edit touches every field and
  // validates right away to show its errors. Create keeps errors hidden until
  // each field is touched.
  useEffect(() => {
    console.log("Validating all fields on mount for customer:", customer);
    if (!customer) return;
    void form.validateAllFields("change");
    void form.validate("change");
  }, [customer, form]);

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
            <form.AppField name="name">
              {(field) => {
                return <field.TextInput id="name" label="Name" />;
              }}
            </form.AppField>
            <form.AppField name="address">
              {(field) => {
                return <field.TextArea id="address" label="Address" />;
              }}
            </form.AppField>
            <form.AppField name="phoneNumber">
              {(field) => {
                return (
                  <field.TextInput
                    id="phoneNumber"
                    label="Phone Number"
                    placeholder="(917) 517 9241"
                    maxLength={PHONE_MAX_LENGTH}
                    format={formatPhoneNumber}
                  />
                );
              }}
            </form.AppField>
            <form.AppField name="email">
              {(field) => {
                return <field.TextInput id="email" label="Email" />;
              }}
            </form.AppField>
            <form.AppField name="tin">
              {(field) => {
                return (
                  <field.TextInput
                    id="tin"
                    label="TIN"
                    placeholder="XXX-XXX-XXX-XXXXX"
                    maxLength={TIN_MAX_LENGTH}
                    format={formatTin}
                  />
                );
              }}
            </form.AppField>
          </FieldGroup>
          {submitError && (
            <FieldError className="mb-4">{submitError}</FieldError>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button className="text-base font-medium" variant="ghost">
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

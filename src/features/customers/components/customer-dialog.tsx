import { useCreateCustomer } from "@/api/endpoints/customers/customers";
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
import { useAppForm } from "@/features/common/hooks/form";
import { formOptions, revalidateLogic } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import z from "zod";
import formatPhoneNumber from "../lib/formatPhoneNumber";
import formatTin from "../lib/formatTIN";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  tin: z.string().regex(/^\d{3}-\d{3}-\d{3}-\d{4}$/, {
    message: "TIN must follow the format: XXX-XXX-XXX-XXXX",
  }),
});

type CustomerFormValues = z.infer<typeof schema>;

const blankValues: CustomerFormValues = {
  name: "",
  address: "",
  phoneNumber: "",
  email: "",
  tin: "",
};

const registerFormOpts = formOptions({
  defaultValues: blankValues,
});

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<CustomerFormValues>;
}

export default function CustomerDialog({
  open,
  onOpenChange,
  defaultValues,
}: CustomerDialogProps) {
  const isEditing = !!defaultValues;

  const queryClient = useQueryClient();

  const { mutate } = useCreateCustomer();

  const form = useAppForm({
    ...registerFormOpts,
    onSubmit: ({ value }) => {
      const processed = schema.parse(value);
      mutate(
        {
          data: {
            name: processed.name,
            address: processed.address,
            tin: processed.tin,
            email: processed.email,
            phoneNumber: processed.phoneNumber,
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/customers"] });
            openChange(false);
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

  const openChange = (state: boolean) => {
    form.reset();
    onOpenChange(state);
  };

  return (
    <Dialog open={open} onOpenChange={openChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {isEditing ? "Edit Customer" : "Create Customer"}
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
                        placeholder="XXX-XXX-XXX-XXXX"
                        format={formatTin}
                      />
                    );
                  }}
                </form.AppField>
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
                    <Button type="submit" disabled={isSubmitting}>
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

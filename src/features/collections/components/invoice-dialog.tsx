import { useGetInvoices } from "@/api/endpoints/invoices/invoices";
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
import { formatDate } from "@/lib/format-date";
import { parseDateFromISO } from "@/lib/parse-date";
import { formOptions } from "@tanstack/react-form";
import { Package } from "lucide-react";
import z from "zod";

const schema = z.object({
  invoices: z.number().array(),
  search: z.string(),
});

type InvoiceFormValues = z.infer<typeof schema>;

const blankValues: InvoiceFormValues = {
  invoices: [],
  search: "",
};

const registerFormOpts = formOptions({
  defaultValues: blankValues,
});

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<InvoiceFormValues>;
}

export default function InvoiceDialog({
  open,
  onOpenChange,
}: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add Service Invoice
          </DialogTitle>
        </DialogHeader>
        {/* Rendered inside DialogContent so the form remounts on every open,
            which re-runs onMount validation with fresh values. */}
        <InvoiceForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function InvoiceForm({ onClose }: { onClose: () => void }) {
  const { data: invoices, isLoading } = useGetInvoices();

  // const navigate = useNavigate();
  const form = useAppForm({
    ...registerFormOpts,
    onSubmit: ({ value }) => {
      const processed = schema.parse(value);
      console.log(processed);
      //navigate({ to: "/deliveries/new", state: processed });
    },
    validators: {
      onMount: schema,
      onChange: schema,
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const filteredInvoices =
    // form.getFieldValue("search") === ""
    //   ? [] :
    invoices
      .filter((invoice) =>
        invoice.id.toString().includes(form.getFieldValue("search")),
      )
      .slice(0, 10);

  if (isLoading) return <div>Loading...</div>;
  console.log(filteredInvoices);
  return (
    <div className="flex flex-col gap-2 py-2">
      <div className="border border-gray-200 bg-muted/80 rounded-lg p-3">
        <p className="text-xs text-gray-400 mb-1">Selected Customer</p>
        <p className="text-sm font-semibold text-gray-900 leading-snug">
          Global International Research and Development Solutions-Asia Pacific
          Logistics Branch
        </p>
        <p className="text-sm text-gray-600">
          359 Mc Arthur Hi-Way, Brgy. Corazon, Calumpit, Bulacan
        </p>
        <p className="text-sm text-gray-600">119-098-1630000</p>
      </div>
      <form.AppForm>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup className="mb-6">
            <form.AppField name="search">
              {(field) => {
                return (
                  <field.TextInput
                    id="search"
                    label=""
                    orientation="vertical"
                    className="flex items-center gap-5"
                    hideError={true}
                  />
                );
              }}
            </form.AppField>
          </FieldGroup>
          <FieldGroup className="mb-6">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between"></div>

              {filteredInvoices.length == 0 ? (
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
                  <div className="flex flex-col gap-2 pr-2">
                    <div>
                      {filteredInvoices.map((item, i) => {
                        return (
                          <form.AppField name={`invoices[${i}]`} key={i}>
                            {(field) => {
                              return (
                                <field.CheckBox
                                  id={item.id}
                                  label=""
                                  description=""
                                  getLabel={() => (
                                    <div className="flex flex-1 items-center gap-3 min-w-0 text-sm">
                                      <span className="font-semibold w-28 shrink-0">
                                        {item.id}
                                      </span>
                                      <span className="flex-1 truncate text-muted-foreground">
                                        Due on{" "}
                                        {formatDate(
                                          parseDateFromISO(
                                            item.createDate,
                                          ).plus({
                                            days: item.dueInDays,
                                          }),
                                        )}
                                      </span>
                                      <span className="text-right text-muted-foreground whitespace-nowrap tabular-nums">
                                        {item.amount}
                                      </span>
                                    </div>
                                  )}
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

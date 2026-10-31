import { useCreateInvoice } from "@/api/endpoints/invoices/invoices";
import { useGetPurchaseOrders } from "@/api/endpoints/purchase-orders/purchase-orders";
import type { DeliveryReceiptDto } from "@/api/models/deliveryReceiptDto";
import { DeliveryReceiptDtoStatus } from "@/api/models/deliveryReceiptDtoStatus";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppForm } from "@/features/common/hooks/form";
import { formOptions } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Archive, ChevronDown, ChevronRight, Info, Search } from "lucide-react";
import { useState } from "react";
import z from "zod";

const schema = z.object({
  terms: z.string().min(1, "Terms are required"),
});

type InvoiceFormValues = z.infer<typeof schema>;

const blankValues: InvoiceFormValues = {
  terms: "30",
};

const registerFormOpts = formOptions({
  defaultValues: blankValues,
});

const terms = [
  { key: "0", value: "Cash" },
  { key: "15", value: "15 days" },
  { key: "30", value: "30 days" },
  { key: "60", value: "60 days" },
  { key: "90", value: "90 days" },
];

type DocumentType = "purchaseOrder" | "deliveryReceipt";

const documentTypes: { key: DocumentType; value: string }[] = [
  { key: "purchaseOrder", value: "Purchase Order" },
  { key: "deliveryReceipt", value: "Delivery Receipt" },
];

// Only delivered delivery receipts that are not yet invoiced can be invoiced.
const isEligible = (dr: DeliveryReceiptDto) =>
  !dr.invoice && (dr.status === DeliveryReceiptDtoStatus.Delivered || dr.status === DeliveryReceiptDtoStatus.Shipped);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const deliveredOn = (dr: DeliveryReceiptDto) =>
  formatDate(
    dr.states?.find((s) => s.status === DeliveryReceiptDtoStatus.Delivered)
      ?.date ?? dr.createDate,
  );

function Highlight({ text, query }: { text: string | number; query: string }) {
  const value = String(text);
  const index = query ? value.toLowerCase().indexOf(query.toLowerCase()) : -1;
  if (index < 0) return <>{value}</>;
  return (
    <>
      {value.slice(0, index)}
      <mark className="rounded-xs bg-muted text-inherit">
        {value.slice(index, index + query.length)}
      </mark>
      {value.slice(index + query.length)}
    </>
  );
}

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function InvoiceDialog({
  open,
  onOpenChange,
}: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create Sales Invoice
          </DialogTitle>
        </DialogHeader>
        {/* Rendered inside DialogContent so the form remounts on every open,
            which re-runs onMount validation with fresh values. */}
        <InvoiceForm onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <div className="flex size-14 items-center justify-center rounded-md bg-muted">
        <Archive className="size-6 text-muted-foreground" />
      </div>
      <p className="text-base">No eligible documents found</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Only approved purchase order and delivered delivery receipt without
        invoice are shown
      </p>
    </div>
  );
}

function InvoiceForm({ onClose }: { onClose: () => void }) {
  const { data: purchaseOrders, isLoading } = useGetPurchaseOrders();
  const { mutate, isPending } = useCreateInvoice();
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] =
    useState<DocumentType>("purchaseOrder");
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState("");
  const [selectedReceipts, setSelectedReceipts] = useState<number[]>([]);
  const [collapsed, setCollapsed] = useState<number[]>([]);

  const navigate = useNavigate();
  const form = useAppForm({
    ...registerFormOpts,
    onSubmit: ({ value }) => {
      const processed = schema.parse(value);
      const deliveryReceipts =
        documentType === "purchaseOrder"
          ? purchaseOrders
              .find((po) => po.id.toString() === selectedPurchaseOrder)
              .deliveryReceipts.filter(isEligible)
              .map((dr) => dr.id)
          : selectedReceipts;
      mutate(
        {
          data: {
            createDate: new Date().toISOString(),
            dueInDays: Number(processed.terms),
            deliveryReceipts,
          },
        },
        {
          onSuccess: (data) => {
            navigate({ to: `/invoices/${data.id}` });
          },
        },
      );
    },
    validators: {
      onMount: schema,
      onChange: schema,
    },
  });

  if (isLoading) return <div>Loading...</div>;

  const query = search.trim();

  // Purchase orders that still have at least one receipt to invoice.
  const eligiblePurchaseOrders = purchaseOrders
    .map((po) => ({ ...po, eligible: po.deliveryReceipts.filter(isEligible) }))
    .filter((po) => po.eligible.length > 0)
    .slice(0,10);

  console.log(purchaseOrders.find((po) => po.id == 3));

  const purchaseOrdersToList = eligiblePurchaseOrders.filter((po) =>
    po.id.toString().includes(query),
  );

  const groupsToList = eligiblePurchaseOrders
    .map((po) => ({
      ...po,
      eligible: po.id.toString().includes(query)
        ? po.eligible
        : po.eligible.filter((dr) => dr.id.toString().includes(query)),
    }))
    .filter((po) => po.eligible.length > 0);

  const hasSelection =
    documentType === "purchaseOrder"
      ? selectedPurchaseOrder !== ""
      : selectedReceipts.length > 0;

  const changeDocumentType = (value: DocumentType) => {
    setDocumentType(value);
    setSelectedPurchaseOrder("");
    setSelectedReceipts([]);
  };

  const toggleReceipt = (id: number, checked: boolean) =>
    setSelectedReceipts((current) =>
      checked ? [...current, id] : current.filter((i) => i !== id),
    );

  const toggleGroup = (id: number) =>
    setCollapsed((current) =>
      current.includes(id) ? current.filter((i) => i !== id) : [...current, id],
    );

  return (
    <form.AppForm>
      <form
        className="flex flex-col gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <div className="flex flex-col gap-5">
          <form.AppField name="terms">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="terms" className="text-base font-medium">
                  Payment terms
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => field.handleChange(value)}
                >
                  <SelectTrigger
                    id="terms"
                    onBlur={field.handleBlur}
                    className="w-full data-[size=default]:h-10"
                  >
                    <SelectValue placeholder="Payment terms" />
                  </SelectTrigger>
                  <SelectContent>
                    {terms.map((t) => (
                      <SelectItem key={t.key} value={t.key}>
                        {t.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </form.AppField>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="search" className="text-base font-medium">
                Documents
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      aria-label="About documents"
                      className="text-foreground"
                    >
                      <Info className="size-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Select a purchase order to invoice all of its delivered
                    receipts, or pick individual delivery receipts.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex gap-2">
              <InputGroup className="h-10 flex-1">
                <InputGroupAddon>
                  <Search />
                </InputGroupAddon>
                <InputGroupInput
                  id="search"
                  placeholder="Search Number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
              <Select
                value={documentType}
                onValueChange={(value) =>
                  changeDocumentType(value as DocumentType)
                }
              >
                <SelectTrigger
                  aria-label="Document type"
                  className="w-44 shrink-0 data-[size=default]:h-10"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="h-72">
              {documentType === "purchaseOrder" ? (
                purchaseOrdersToList.length === 0 ? (
                  <div className="h-72">
                    <EmptyState />
                  </div>
                ) : (
                  <RadioGroup
                    className="gap-0 pr-3"
                    value={selectedPurchaseOrder}
                    onValueChange={setSelectedPurchaseOrder}
                  >
                    {purchaseOrdersToList.map((po) => (
                      <Label
                        key={po.id}
                        htmlFor={`po-${po.id}`}
                        className="flex cursor-pointer items-center gap-3 border-b px-1 py-3 font-normal transition-colors hover:bg-muted/40"
                      >
                        <RadioGroupItem
                          value={String(po.id)}
                          id={`po-${po.id}`}
                        />
                        <span className="w-28 shrink-0 text-base">
                          <Highlight text={po.id} query={query} />
                        </span>
                        <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                          {po.customer.name}
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
                          {po.eligible.length} Delivery Receipt
                        </span>
                      </Label>
                    ))}
                  </RadioGroup>
                )
              ) : groupsToList.length === 0 ? (
                <div className="h-72">
                  <EmptyState />
                </div>
              ) : (
                <div className="pr-3">
                  {groupsToList.map((po) => {
                    const isCollapsed = collapsed.includes(po.id);
                    return (
                      <div key={po.id} className="border-b last:border-b-0">
                        <button
                          type="button"
                          onClick={() => toggleGroup(po.id)}
                          aria-expanded={!isCollapsed}
                          className="flex w-full items-center gap-3 px-1 py-3 text-left"
                        >
                          {isCollapsed ? (
                            <ChevronRight className="size-4 shrink-0" />
                          ) : (
                            <ChevronDown className="size-4 shrink-0" />
                          )}
                          <span className="w-28 shrink-0 text-base">
                            {po.id}
                          </span>
                          <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                            {po.customer.name}
                          </span>
                          <span className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
                            {po.eligible.length} Delivery Receipt
                          </span>
                        </button>
                        {!isCollapsed &&
                          po.eligible.map((dr) => (
                            <Label
                              key={dr.id}
                              htmlFor={`dr-${dr.id}`}
                              className="flex cursor-pointer items-center gap-3 py-3 pl-8 font-normal transition-colors hover:bg-muted/40"
                            >
                              <Checkbox
                                id={`dr-${dr.id}`}
                                checked={selectedReceipts.includes(dr.id)}
                                onCheckedChange={(checked) =>
                                  toggleReceipt(dr.id, checked === true)
                                }
                              />
                              <span className="w-32 shrink-0 text-base">
                                <Highlight text={dr.id} query={query} />
                              </span>
                              <span className="text-sm text-muted-foreground">
                                Delivered on {deliveredOn(dr)}
                              </span>
                            </Label>
                          ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <DialogFooter className="items-center">
          <Button
            type="button"
            variant="ghost"
            className="text-base font-medium"
            onClick={onClose}
          >
            Cancel
          </Button>
          <form.Subscribe selector={(state) => state.canSubmit}>
            {(canSubmit) => (
              <Button
                type="submit"
                className="text-base"
                disabled={!canSubmit || !hasSelection || isPending}
              >
                {isPending ? "Creating..." : "Create"}
              </Button>
            )}
          </form.Subscribe>
        </DialogFooter>
      </form>
    </form.AppForm>
  );
}

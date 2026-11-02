import {
  useGetDeliveryReceipt,
  useGetDeliveryReceipts,
} from "@/api/endpoints/delivery-receipts/delivery-receipts";
import { useCreateInvoice } from "@/api/endpoints/invoices/invoices";
import {
  getGetJobOrderQueryKey,
  useGetJobOrders,
} from "@/api/endpoints/job-orders/job-orders";
import { useGetPurchaseOrders } from "@/api/endpoints/purchase-orders/purchase-orders";
import type { DeliveryReceiptDto } from "@/api/models/deliveryReceiptDto";
import { DeliveryReceiptDtoStatus } from "@/api/models/deliveryReceiptDtoStatus";
import type { JobOrderDto } from "@/api/models/jobOrderDto";
import { JobOrderDtoStatus } from "@/api/models/jobOrderDtoStatus";
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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  SupportingDocumentsSection,
  useSupportingDocuments,
} from "@/features/common/components/supporting-documents";
import { useAppForm } from "@/features/common/hooks/form";
import { uploadFiles } from "@/features/common/lib/upload-files";
import { formOptions } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Archive, ChevronDown, ChevronRight, Info, Search } from "lucide-react";
import { useState } from "react";
import z from "zod";

const schema = z.object({
  terms: z.string().min(1, "Terms are required"),
  notes: z.string(),
});

type InvoiceFormValues = z.infer<typeof schema>;

const blankValues: InvoiceFormValues = {
  terms: "30",
  notes: "",
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

type DocumentType = "purchaseOrder" | "jobOrder" | "deliveryReceipt";

const documentTypes: { key: DocumentType; value: string }[] = [
  { key: "purchaseOrder", value: "Purchase Order" },
  { key: "jobOrder", value: "Job Order" },
  { key: "deliveryReceipt", value: "Delivery Receipt" },
];

// Only delivered delivery receipts that are not yet invoiced can be invoiced.
const isEligible = (dr: DeliveryReceiptDto) =>
  !dr.invoice &&
  (dr.status === DeliveryReceiptDtoStatus.Delivered ||
    dr.status === DeliveryReceiptDtoStatus.Shipped);

const isJobOrderEligible = (jo: JobOrderDto) =>
  !jo.invoice &&
  (jo.status === JobOrderDtoStatus.Approved ||
    jo.status === JobOrderDtoStatus.Finalized);

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

// Receipts nested in purchase orders don't carry their status history, so it
// is loaded per visible row. Shows when the receipt reached its current status
// ("Delivered on" or "Shipped on").
function StatusDate({ dr }: { dr: DeliveryReceiptDto }) {
  const { data } = useGetDeliveryReceipt(dr.id);
  const label =
    dr.status === DeliveryReceiptDtoStatus.Delivered ? "Delivered" : "Shipped";
  const date =
    data?.states?.find((s) => s.status === dr.status)?.date ?? data?.createDate;
  return (
    <span className="text-sm text-muted-foreground">
      {date ? `${label} on ${formatDate(date)}` : label}
    </span>
  );
}

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
  // Invoices this purchase order's delivery receipts and hides the document
  // picker.
  purchaseOrderId?: number;
  // Invoices this job order directly and hides the document picker.
  jobOrderId?: number;
  // Invoices just this delivery receipt and hides the document picker.
  deliveryReceiptId?: number;
}

export default function InvoiceDialog({
  open,
  onOpenChange,
  purchaseOrderId,
  jobOrderId,
  deliveryReceiptId,
}: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Create Sales Invoice
          </DialogTitle>
        </DialogHeader>
        {/* Rendered inside DialogContent so the form remounts on every open,
            which re-runs onMount validation with fresh values. */}
        <InvoiceForm
          onClose={() => onOpenChange(false)}
          purchaseOrderId={purchaseOrderId}
          jobOrderId={jobOrderId}
          deliveryReceiptId={deliveryReceiptId}
        />
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
        Only approved purchase orders, job orders, and delivered delivery receipts without
        invoice are shown
      </p>
    </div>
  );
}

function InvoiceForm({
  onClose,
  purchaseOrderId,
  jobOrderId,
  deliveryReceiptId,
}: {
  onClose: () => void;
  purchaseOrderId?: number;
  jobOrderId?: number;
  deliveryReceiptId?: number;
}) {
  const { data: purchaseOrders = [], isLoading: isLoadingPOs } =
    useGetPurchaseOrders();
  // Delivery receipts nested in purchase orders don't include notes, so they
  // are looked up from the delivery receipts list to make them searchable.
  const { data: deliveryReceipts = [], isLoading: isLoadingReceipts } =
    useGetDeliveryReceipts();
  const { data: jobOrders = [], isLoading: isLoadingJobOrders } =
    useGetJobOrders();
  const { mutate, isPending } = useCreateInvoice();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [documentType, setDocumentType] = useState<DocumentType>(
    jobOrderId !== undefined ? "jobOrder" : "purchaseOrder",
  );
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState(
    purchaseOrderId !== undefined ? String(purchaseOrderId) : "",
  );
  const [selectedJobOrder, setSelectedJobOrder] = useState(
    jobOrderId !== undefined ? String(jobOrderId) : "",
  );
  const [selectedReceipts, setSelectedReceipts] = useState<number[]>([]);
  const [collapsed, setCollapsed] = useState<number[]>([]);

  const navigate = useNavigate();
  const docs = useSupportingDocuments();
  const form = useAppForm({
    ...registerFormOpts,
    onSubmit: ({ value }) => {
      const processed = schema.parse(value);
      const targetJobOrderId =
        jobOrderId !== undefined
          ? jobOrderId
          : documentType === "jobOrder"
            ? Number(selectedJobOrder)
            : undefined;

      const deliveryReceiptsPayload =
        targetJobOrderId !== undefined
          ? undefined
          : deliveryReceiptId !== undefined
            ? [deliveryReceiptId]
            : documentType === "purchaseOrder"
              ? purchaseOrders
                  .find((po) => po.id.toString() === selectedPurchaseOrder)
                  ?.deliveryReceipts?.filter(isEligible)
                  .map((dr) => dr.id) ?? []
              : selectedReceipts;

      mutate(
        {
          data: {
            createDate: new Date().toISOString(),
            dueInDays: Number(processed.terms),
            notes: processed.notes,
            ...(targetJobOrderId !== undefined
              ? { jobOrder: targetJobOrderId }
              : { deliveryReceipts: deliveryReceiptsPayload }),
          },
        },
        {
          onSuccess: async (data) => {
            if (targetJobOrderId !== undefined) {
              await queryClient.invalidateQueries({
                queryKey: ["/job-orders"],
              });
              await queryClient.invalidateQueries({
                queryKey: getGetJobOrderQueryKey(targetJobOrderId),
              });
            }
            const files = docs.getFiles();
            if (files.length > 0) {
              await uploadFiles("invoices", data.id, files);
            }
            await queryClient.invalidateQueries({ queryKey: ["/invoices"] });
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

  if (isLoadingPOs || isLoadingReceipts || isLoadingJobOrders)
    return <div>Loading...</div>;

  const query = search.trim();
  const receiptNotes = new Map(
    (deliveryReceipts ?? []).map((dr) => [dr.id, dr.notes]),
  );

  // Purchase orders that still have at least one receipt to invoice.
  const eligiblePurchaseOrders = purchaseOrders
    .map((po) => ({
      ...po,
      eligible: (po.deliveryReceipts ?? []).filter(isEligible),
    }))
    .filter((po) => po.eligible.length > 0);

  const eligibleJobOrders = jobOrders.filter(isJobOrderEligible);

  const matches = (id: number, notes?: string | null) =>
    id.toString().includes(query) ||
    (notes ?? "").toLowerCase().includes(query.toLowerCase());

  const purchaseOrdersToList = eligiblePurchaseOrders
    .filter(
      (po) =>
        matches(po.id, po.notes) ||
        (po.customer?.name ?? "").toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 10);

  const jobOrdersToList = eligibleJobOrders
    .filter(
      (jo) =>
        matches(jo.id, jo.notes) ||
        (jo.customer?.name ?? "").toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 10);

  const groupsToList = eligiblePurchaseOrders
    .map((po) => ({
      ...po,
      eligible: matches(po.id, po.notes)
        ? po.eligible
        : po.eligible.filter((dr) => matches(dr.id, receiptNotes.get(dr.id))),
    }))
    .filter((po) => po.eligible.length > 0)
    .slice(0, 10);

  const isLocked =
    purchaseOrderId !== undefined ||
    jobOrderId !== undefined ||
    deliveryReceiptId !== undefined;

  const lockedEligible =
    deliveryReceiptId !== undefined
      ? eligiblePurchaseOrders.some((po) =>
          po.eligible.some((dr) => dr.id === deliveryReceiptId),
        )
      : jobOrderId !== undefined
        ? eligibleJobOrders.some((jo) => jo.id === jobOrderId)
        : eligiblePurchaseOrders.some((po) => po.id === purchaseOrderId);

  const hasSelection = isLocked
    ? lockedEligible
    : documentType === "purchaseOrder"
      ? selectedPurchaseOrder !== ""
      : documentType === "jobOrder"
        ? selectedJobOrder !== ""
        : selectedReceipts.length > 0;

  const changeDocumentType = (value: DocumentType) => {
    setDocumentType(value);
    setSelectedPurchaseOrder("");
    setSelectedJobOrder("");
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

          <form.AppField name="notes">
            {(field) => (
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes" className="text-base font-medium">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Notes"
                  className="resize-none"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.AppField>

          <SupportingDocumentsSection
            {...docs}
            headingClassName="mb-2 text-base font-medium"
          />

          {isLocked ? (
            !lockedEligible && (
              <p className="text-sm text-muted-foreground">
                {deliveryReceiptId !== undefined
                  ? `Delivery receipt ${deliveryReceiptId} cannot be invoiced. It must be shipped or delivered and not yet invoiced.`
                  : jobOrderId !== undefined
                    ? `Job order ${jobOrderId} cannot be invoiced. It must be finalized or approved and not yet invoiced.`
                    : `Purchase order ${purchaseOrderId} has no delivered or shipped delivery receipts left to invoice.`}
              </p>
            )
          ) : (
            <>
              <Separator />

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
                        Select a purchase order to invoice its delivered
                        receipts, a job order to invoice directly, or pick
                        individual delivery receipts.
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
                        className="relative gap-0 pr-3"
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
                  ) : documentType === "jobOrder" ? (
                    jobOrdersToList.length === 0 ? (
                      <div className="h-72">
                        <EmptyState />
                      </div>
                    ) : (
                      <RadioGroup
                        className="relative gap-0 pr-3"
                        value={selectedJobOrder}
                        onValueChange={setSelectedJobOrder}
                      >
                        {jobOrdersToList.map((jo) => (
                          <Label
                            key={jo.id}
                            htmlFor={`jo-${jo.id}`}
                            className="flex cursor-pointer items-center gap-3 border-b px-1 py-3 font-normal transition-colors hover:bg-muted/40"
                          >
                            <RadioGroupItem
                              value={String(jo.id)}
                              id={`jo-${jo.id}`}
                            />
                            <span className="w-28 shrink-0 text-base">
                              <Highlight text={jo.id} query={query} />
                            </span>
                            <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                              {jo.customer?.name}
                            </span>
                            <span className="shrink-0 whitespace-nowrap text-sm text-muted-foreground">
                              {(jo.lineItems ?? []).length} Line Items
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
                    <div className="relative pr-3">
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
                                  <StatusDate dr={dr} />
                                </Label>
                              ))}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </>
          )}
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

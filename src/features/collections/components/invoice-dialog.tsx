import { useGetInvoices } from "@/api/endpoints/invoices/invoices";
import type { CustomerDto } from "@/api/models";
import { InvoiceDtoStatus } from "@/api/models/invoiceDtoStatus";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import Highlight from "@/features/common/components/highlight";
import { formatDate } from "@/lib/format-date";
import { parseDateFromISO } from "@/lib/parse-date";
import { Archive, Search } from "lucide-react";
import { useState } from "react";

interface InvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer: CustomerDto;
  // Invoices already added to the collection, which can't be added twice.
  excludedIds: number[];
  onAdd: (invoiceIds: number[]) => void;
}

export default function InvoiceDialog({
  open,
  onOpenChange,
  customer,
  excludedIds,
  onAdd,
}: InvoiceDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Add Service Invoice
          </DialogTitle>
        </DialogHeader>
        {/* Rendered inside DialogContent so the selection and search reset on
            every open. */}
        <InvoiceForm
          customer={customer}
          excludedIds={excludedIds}
          onAdd={(ids) => {
            onAdd(ids);
            onOpenChange(false);
          }}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        <Archive className="size-5 text-muted-foreground" />
      </div>
      <p className="text-sm">No Invoice Number Found</p>
      <p className="max-w-xs text-xs text-muted-foreground">
        Search by invoice number to see matching invoices for this customer
      </p>
    </div>
  );
}

function InvoiceForm({
  customer,
  excludedIds,
  onAdd,
  onClose,
}: Omit<InvoiceDialogProps, "open" | "onOpenChange"> & {
  onClose: () => void;
}) {
  const { data: invoices, isLoading } = useGetInvoices();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<number[]>([]);

  if (isLoading) return <div>Loading...</div>;

  const query = search.trim();

  // Only unpaid invoices of the selected customer that aren't added yet.
  const invoicesToList = invoices.filter(
    (invoice) =>
      invoice.customer?.id === customer.id &&
      invoice.status === InvoiceDtoStatus.Unpaid &&
      !excludedIds.includes(invoice.id) &&
      invoice.id.toString().includes(query),
  );

  const toggle = (id: number, checked: boolean) =>
    setSelected((current) =>
      checked ? [...current, id] : current.filter((i) => i !== id),
    );

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        onAdd(selected);
      }}
    >
      <div className="rounded-lg bg-muted/60 p-3">
        <p className="mb-1 text-xs text-muted-foreground">Selected Customer</p>
        <p className="text-sm leading-snug">{customer.name}</p>
        <p className="text-sm text-muted-foreground">{customer.address}</p>
        <p className="text-sm text-muted-foreground">{customer.tin}</p>
      </div>

      <InputGroup className="h-10">
        <InputGroupAddon>
          <Search />
        </InputGroupAddon>
        <InputGroupInput
          aria-label="Search invoice number"
          placeholder="Search number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      <ScrollArea className="h-64">
        {invoicesToList.length === 0 ? (
          <div className="h-64">
            <EmptyState />
          </div>
        ) : (
          <div className="pr-3">
            {invoicesToList.map((invoice) => (
              <Label
                key={invoice.id}
                htmlFor={`invoice-${invoice.id}`}
                className="flex cursor-pointer items-center gap-3 border-b px-1 py-3 font-normal transition-colors hover:bg-muted/40"
              >
                <Checkbox
                  id={`invoice-${invoice.id}`}
                  checked={selected.includes(invoice.id)}
                  onCheckedChange={(checked) =>
                    toggle(invoice.id, checked === true)
                  }
                />
                <span className="w-28 shrink-0 text-base">
                  <Highlight text={invoice.id} query={query} />
                </span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  Due on{" "}
                  {formatDate(
                    parseDateFromISO(invoice.createDate).plus({
                      days: invoice.dueInDays,
                    }),
                  )}
                </span>
                <span className="shrink-0 whitespace-nowrap text-right text-xs tabular-nums text-muted-foreground">
                  {invoice.amount.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </Label>
            ))}
          </div>
        )}
      </ScrollArea>

      <DialogFooter className="items-center">
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={selected.length === 0}>
          Add Invoice
        </Button>
      </DialogFooter>
    </form>
  );
}

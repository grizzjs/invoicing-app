import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SelectCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SelectCustomerDialog({
  open,
  onOpenChange,
}: SelectCustomerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Select a customer first
          </DialogTitle>
          <DialogDescription>
            Choose a customer before adding an invoice. Only that customer's
            unpaid invoices can be added.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

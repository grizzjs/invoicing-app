import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useState } from "react";
import type { Customer } from "../definition";
import CustomerDialog from "./customer-dialog";

interface CustomerRowActionsProps {
  customer: Customer;
}

export function CustomerRowActions({ customer }: CustomerRowActionsProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        aria-label="Edit customer"
        onClick={() => setEditOpen(true)}
      >
        <Pencil size={15} />
      </Button>
      <CustomerDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        customer={customer}
      />
    </div>
  );
}

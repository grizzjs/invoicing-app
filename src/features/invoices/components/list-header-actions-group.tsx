import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/ui/header-actions";
import { Plus } from "lucide-react";
import { useState } from "react";
import InvoiceDialog from "./invoice-dialog";

export function HeaderActionsGroup() {
  const [open, setOpen] = useState(false);
  return (
    <HeaderActions>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Create new
      </Button>
      <InvoiceDialog open={open} onOpenChange={setOpen} />
    </HeaderActions>
  );
}

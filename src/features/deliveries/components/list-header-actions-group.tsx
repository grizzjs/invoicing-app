import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/ui/header-actions";
import { Plus } from "lucide-react";
import { useState } from "react";
import PurchaseOrderDialog from "./purchase-order-dialog";

export function HeaderActionsGroup() {
  const [open, setOpen] = useState(false);
  return (
    <HeaderActions>
      <Button onClick={() => setOpen(true)}>
        <Plus /> Create new
      </Button>
      <PurchaseOrderDialog open={open} onOpenChange={setOpen} />
    </HeaderActions>
  );
}

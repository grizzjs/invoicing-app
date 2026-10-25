import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/ui/header-actions";
import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";

export function HeaderActionsGroup() {
  return (
    <HeaderActions>
      <Button asChild>
        <Link to="new">
          <Plus /> Create new
        </Link>
      </Button>
    </HeaderActions>
  );
}

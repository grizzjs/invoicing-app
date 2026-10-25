import { Button } from "@/components/ui/button";
import { HeaderActions } from "@/components/ui/header-actions";
import { Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";

export function HeaderActionsGroup() {
  return (
    <>
      <HeaderActions>
        <Button variant="outline" asChild>
          <Link to={`pdf`} target="_blank">
            <Printer /> Print
          </Link>
        </Button>
      </HeaderActions>
    </>
  );
}

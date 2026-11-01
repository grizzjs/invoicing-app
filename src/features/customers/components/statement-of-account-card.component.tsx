import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Key } from "@/components/ui/key-pair/key";
import { Value } from "@/components/ui/key-pair/value";
import format from "@/lib/format-money";
import { Link } from "@tanstack/react-router";
import { Printer } from "lucide-react";

interface StatementOfAccountCardOptions {
  account: {
    previousBalance: number;
    newCharges: number;
    credits: number;
    outstandingBalance: number;
  };
  className?: string;
}

export function StatementOfAccountCard({
  account,
  className = "",
}: StatementOfAccountCardOptions) {
  return (
    <Card className={`rounded-lg border-0.5px border-#989898 ${className}`}>
      <CardContent>
        <div className="mb-4 text-xs font-normal text-gray-500">
          Statement of Account
        </div>
        <div className="grid grid-cols-2 grid-rows-4 gap-2">
          <Key>Previous Balance</Key>
          <Value className="justify-self-end">
            {format(account.previousBalance)}
          </Value>
          <Key>Credits</Key>
          <Value className="justify-self-end">{format(account.credits)}</Value>
          <Key>New Charges</Key>
          <Value className="justify-self-end">
            {format(account.newCharges)}
          </Value>
          <Key>Outstanding Balance</Key>
          <Value className="justify-self-end">
            {format(account.outstandingBalance)}
          </Value>
        </div>

        <Button
          variant="secondary"
          className="mt-5 w-full py-2.5 px-3 text-sm"
          asChild
        >
          <Link to={`statements/${`202601`}`} target="_blank">
            <Printer className="h-4 w-4" />
            Print Statement
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

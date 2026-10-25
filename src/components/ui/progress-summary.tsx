import type { PropsWithChildren } from "react";
import { Card, CardContent } from "./card";

type ProgressSummaryProps = PropsWithChildren<{
  className?: string;
  title: string;
}>;

export function ProgressSummary({ title, children }: ProgressSummaryProps) {
  return (
    <Card className="rounded-lg">
      <CardContent className="grid gap-6">
        <p className="text-xs font-normal text-gray-500">{title}</p>
        {children}
      </CardContent>
    </Card>
  );
}

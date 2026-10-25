import { Card, CardContent } from "@/components/ui/card";
import { type PropsWithChildren } from "react";
import { Key } from "./key-pair/key";
import { Value } from "./key-pair/value";

type DetailsCardProps = PropsWithChildren<{
  details: string;
  className?: string;
}>;

type DetailsPropertyProps = PropsWithChildren<{
  header: string;
  value?: string;
}>;

export function DetailProperty({
  header,
  value,
  children,
}: DetailsPropertyProps) {
  return (
    <div>
      <Key className="mb-2">{header}</Key>
      <Value>{value ? value : children}</Value>
    </div>
  );
}

export function DetailsCard({
  details,
  children,
  className = "",
}: DetailsCardProps) {
  return (
    <Card
      className={`rounded-lg border-0.5px border-#989898 gap-4 ${className}`}
    >
      <CardContent>
        <p className="mb-4 text-xs font-normal text-gray-500">{details}</p>
        <div className="grid grid-cols-2 gap-6">{children}</div>
      </CardContent>
    </Card>
  );
}

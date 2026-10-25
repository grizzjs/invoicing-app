import type { PropsWithChildren } from "react";

type HeaderActionsProps = PropsWithChildren<{}>;

export function HeaderActions({ children }: HeaderActionsProps) {
  return <div className="flex gap-2">{children}</div>;
}

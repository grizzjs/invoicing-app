import type { PropsWithChildren } from "react";
import { Status, StatusLabel } from "./status";

type HeaderProps = PropsWithChildren<{
  title;
  entity?: {
    id: number;
  };
  action?: string;
  badge?: {
    status?: string;
    variant?: "info" | "success" | "warning" | "error" | "default";
  };
}>;

export function Header({
  title,
  badge,
  entity,
  children,
  action,
}: HeaderProps) {
  return (
    <div className="border-b border-#989898 bg-white px-6 py-4 h-16">
      <div className="flex items-center justify-between gap-4 h-7">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-gray-900">{title}</h1>
          {entity?.id && (
            <>
              <div className="h-5 w-px bg-gray-300" />
              <span className="text-base font-normal">{`#${entity.id}`}</span>
            </>
          )}
          {action && (
            <>
              <div className="h-5 w-px bg-gray-300" />
              <span className="text-base font-normal">{action}</span>
            </>
          )}
          {badge?.status && (
            <Status variant={badge.variant}>
              <StatusLabel>{badge.status}</StatusLabel>
            </Status>
          )}
        </div>
        <div className="flex items-center gap-4">{children}</div>
      </div>
    </div>
  );
}

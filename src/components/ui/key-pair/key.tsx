import type { PropsWithChildren } from "react";

type Key = PropsWithChildren<{
  className?: string;
}>;

export function Key({ children, className = "" }: Key) {
  return (
    <div className={`text-base font-medium text-gray-800 ${className}`}>
      {children}
    </div>
  );
}

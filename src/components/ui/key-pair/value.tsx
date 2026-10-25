import type { PropsWithChildren } from "react";

type Value = PropsWithChildren<{
  className?: string;
}>;

export function Value({ children, className = "" }: Value) {
  return (
    <div className={`text-base font-normal text-gray-500 ${className}`}>
      {children}
    </div>
  );
}

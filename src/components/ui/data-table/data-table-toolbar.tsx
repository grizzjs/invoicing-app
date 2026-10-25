"use client";

import { type Option } from "@/components/ui/data-table/data-table";
import { DataTableDateFilter } from "@/components/ui/data-table/data-table-date-filter";
import { DataTableFacetedFilter } from "@/components/ui/data-table/data-table-faceted-filter";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import "@tanstack/react-table";
import type { Column, RowData, Table } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { identity } from "ramda";
import * as React from "react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    variant?:
      | "select"
      | "multiSelect"
      | "date"
      | "text"
      | "number"
      | "range"
      | "dateRange";
    className?: string;
    placeholder?: string;
    label?: string;
    options?: Option[];
    unit?: string;
  }
}

interface DataTableToolbarProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
  enableSearch?: boolean;
}

export function DataTableToolbar<TData>({
  table,
  className,
  enableSearch,
  ...props
}: DataTableToolbarProps<TData>) {
  const columns = React.useMemo(
    () => table.getAllColumns().filter((column) => column.getCanFilter()),
    [table],
  );

  const isJustifiedEnd =
    columns.map((column) => column.columnDef.meta).filter(identity).length == 0;

  return (
    <div
      role="toolbar"
      aria-orientation="horizontal"
      className={cn("flex items-start", className)}
      {...props}
    >
      <div
        className={cn("flex flex-1 mb-4 gap-2", {
          "justify-end": isJustifiedEnd,
        })}
      >
        {enableSearch && (
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              className="pl-8 w-56"
              placeholder="Search..."
              value={table.getState().globalFilter ?? ""}
              onChange={(e) => table.setGlobalFilter(String(e.target.value))}
            />
          </div>
        )}

        {columns.map((column) => (
          <DataTableToolbarFilter key={column.id} column={column} />
        ))}
      </div>
    </div>
  );
}
interface DataTableToolbarFilterProps<TData> {
  column: Column<TData>;
}

function DataTableToolbarFilter<TData>({
  column,
}: DataTableToolbarFilterProps<TData>) {
  {
    const columnMeta = column.columnDef.meta;

    const onFilterRender = React.useCallback(() => {
      if (!columnMeta?.variant) return null;

      switch (columnMeta.variant) {
        // case "text":
        //   return (
        //     <Input
        //       placeholder={columnMeta.placeholder ?? columnMeta.label}
        //       value={(column.getFilterValue() as string) ?? ""}
        //       onChange={(event) => column.setFilterValue(event.target.value)}
        //       className="h-8 w-40 lg:w-56"
        //     />
        //   );

        // case "number":
        //   return (
        //     <div className="relative">
        //       <Input
        //         type="number"
        //         inputMode="numeric"
        //         placeholder={columnMeta.placeholder ?? columnMeta.label}
        //         value={(column.getFilterValue() as string) ?? ""}
        //         onChange={(event) => column.setFilterValue(event.target.value)}
        //         className={cn("h-8 w-[120px]", columnMeta.unit && "pr-8")}
        //       />
        //       {columnMeta.unit && (
        //         <span className="absolute top-0 right-0 bottom-0 flex items-center rounded-r-md bg-accent px-2 text-muted-foreground text-sm">
        //           {columnMeta.unit}
        //         </span>
        //       )}
        //     </div>
        //   );

        // case "range":
        //   return (
        //     <DataTableSliderFilter
        //       column={column}
        //       title={columnMeta.label ?? column.id}
        //     />
        //   );

        case "date":
        case "dateRange":
          return (
            <DataTableDateFilter
              column={column}
              title={columnMeta.label ?? column.id}
              multiple={columnMeta.variant === "dateRange"}
            />
          );

        case "select":
        case "multiSelect":
          return (
            <DataTableFacetedFilter
              column={column}
              title={columnMeta.label ?? column.id}
              options={columnMeta.options ?? []}
              multiple={columnMeta.variant === "multiSelect"}
            />
          );

        default:
          return null;
      }
    }, [column, columnMeta]);

    return onFilterRender();
  }
}

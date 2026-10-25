import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { DataTableToolbar } from "@/components/ui/data-table/data-table-toolbar";

import { useState } from "react";
import { Key } from "../key-pair/key";
import { Value } from "../key-pair/value";
import DataTablePagination from "./data-table-pagination";

export interface Option {
  label: string;
  value: string;
  count?: number;
  icon?: React.FC<React.SVGProps<SVGSVGElement>>;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  enableSearch?: boolean;
  enablePagination?: boolean;
  initialState?: { id: string; value: string | number | string[] };
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  initialState,
  className,
  enableSearch = false,
  enablePagination = true,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onPaginationChange: setPagination,
    state: {
      globalFilter,
      pagination,
    },
    initialState: {
      columnFilters: [initialState].filter((f) => f),
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
  });

  return (
    <div className={className}>
      <DataTableToolbar table={table} enableSearch={enableSearch} />

      <Table className="rounded-lg border bg-white py-6">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    className="py-4 px-6"
                    key={header.id}
                    colSpan={header.colSpan}
                  >
                    <Key>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </Key>
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="p-4 px-6">
                    <Value>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </Value>
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <Key>No results.</Key>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {enablePagination ? <DataTablePagination table={table} /> : null}
    </div>
  );
}

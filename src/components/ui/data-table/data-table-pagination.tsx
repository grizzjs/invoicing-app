import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { Table } from "@tanstack/react-table";

const getPageRange = (
  currentIndex: number,
  pageCount: number,
): (number | "...")[] => {
  const current = currentIndex + 1; // convert to 1-based

  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  if (current <= 2) {
    return [1, 2, 3, "...", pageCount];
  }

  if (current >= pageCount - 3) {
    return [
      1,
      "...",
      pageCount - 4,
      pageCount - 3,
      pageCount - 2,
      pageCount - 1,
      pageCount,
    ];
  }

  return [1, "...", current - 1, current, current + 1, "...", pageCount];
};

interface DataTablePaginationProps<TData> extends React.ComponentProps<"div"> {
  table: Table<TData>;
}

export default function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const { pageIndex } = table.getState().pagination;
  const pageCount = table.getPageCount();
  const pages = getPageRange(pageIndex, pageCount);

  return (
    <div className="flex items-center space-x-2 py-6">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={() => table.previousPage()}
              aria-disabled={!table.getCanPreviousPage()}
              tabIndex={!table.getCanPreviousPage() ? -1 : undefined}
              className={
                !table.getCanPreviousPage()
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>

          {/* Page numbers */}
          {pages.map((page, i) =>
            page === "..." ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  isActive={page === pageIndex + 1}
                  onClick={() => table.setPageIndex(page - 1)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={() => table.nextPage()}
              aria-disabled={!table.getCanNextPage()}
              tabIndex={!table.getCanNextPage() ? -1 : undefined}
              className={
                !table.getCanNextPage()
                  ? "pointer-events-none opacity-50"
                  : undefined
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}

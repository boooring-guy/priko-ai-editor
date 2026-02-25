import { useId } from "react";

import {
  ChevronFirstIcon,
  ChevronLastIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TablePaginationProps {
  /** The current page number (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Total number of items/products across all pages */
  totalItems: number;
  /** The number of items to show per page */
  pageSize: number;
  /** Callback when the page size is changed via the select dropdown */
  onPageSizeChange: (newPageSize: number) => void;
  /** Callback when a specific page is selected (1-indexed) */
  onPageChange: (newPage: number) => void;
  /** Optional array of supported page size options. Defaults to [10, 25, 50, 100] */
  pageSizeOptions?: number[];
  /** Optional item name for the descriptive text (e.g. "products"). Defaults to "results" */
  itemName?: string;
  className?: string;
}

export const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageSizeChange,
  onPageChange,
  pageSizeOptions = [10, 25, 50, 100],
  itemName = "results",
  className,
}: TablePaginationProps) => {
  const id = useId();

  // Calculate the range of items currently being shown
  const startItemOffset = (currentPage - 1) * pageSize + 1;
  const endItemOffset = Math.min(currentPage * pageSize, totalItems);

  // Generate the window of page numbers to show
  const renderPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="1">
          <PaginationLink onClick={() => onPageChange(1)}>1</PaginationLink>
        </PaginationItem>,
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      if (totalPages === 0) break;
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            isActive={currentPage === i}
            onClick={() => onPageChange(i)}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <PaginationEllipsis />
              </TooltipTrigger>
              <TooltipContent>
                <p>More pages</p>
              </TooltipContent>
            </Tooltip>
          </PaginationItem>,
        );
      }
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    return items;
  };

  return (
    <div
      className={`flex w-full items-center justify-between px-2 ${className || ""}`}
    >
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium">
          Rows per page
        </Label>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => onPageSizeChange(Number(val))}
        >
          <SelectTrigger id={id} className="h-8 w-[70px]">
            <SelectValue placeholder={String(pageSize)} />
          </SelectTrigger>
          <SelectContent side="top">
            {pageSizeOptions.map((opt) => (
              <SelectItem key={opt} value={String(opt)}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-6 lg:gap-8">
        <div className="flex items-center justify-center text-sm font-medium text-muted-foreground">
          Showing{" "}
          <span className="text-foreground mx-1">
            {totalItems > 0 ? startItemOffset : 0}
          </span>{" "}
          to <span className="text-foreground mx-1">{endItemOffset}</span> of{" "}
          <span className="text-foreground mx-1">{totalItems}</span> {itemName}
        </div>

        <Pagination className="w-auto mx-0">
          <PaginationContent className="gap-1">
            <PaginationItem>
              <PaginationLink
                aria-label="Go to first page"
                size="icon"
                className={`h-8 w-8 ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                onClick={() => onPageChange(1)}
              >
                <ChevronFirstIcon className="size-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                aria-label="Go to previous page"
                size="icon"
                className={`h-8 w-8 ${currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              >
                <ChevronLeftIcon className="size-4" />
              </PaginationLink>
            </PaginationItem>

            {renderPaginationItems()}

            <PaginationItem>
              <PaginationLink
                aria-label="Go to next page"
                size="icon"
                className={`h-8 w-8 ${currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                onClick={() =>
                  onPageChange(Math.min(totalPages, currentPage + 1))
                }
              >
                <ChevronRightIcon className="size-4" />
              </PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink
                aria-label="Go to last page"
                size="icon"
                className={`h-8 w-8 ${currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}`}
                onClick={() => onPageChange(totalPages)}
              >
                <ChevronLastIcon className="size-4" />
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

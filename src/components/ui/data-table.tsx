"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/shadcn-studio/pagination/table-pagination";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { GoSearch } from "react-icons/go";
import { useState, useEffect } from "react";
import { Button } from "./button";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  totalItems: number;
  pagination: PaginationState;
  setPagination: (
    updater: PaginationState | ((old: PaginationState) => PaginationState),
  ) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
  sorting?: SortingState;
  setSorting?: (
    updater: SortingState | ((old: SortingState) => SortingState),
  ) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  totalItems,
  pagination,
  setPagination,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  onRowClick,
  sorting,
  setSorting,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    pageCount,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualSorting: true,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  const [jumpPage, setJumpPage] = useState("");
  const [localSearch, setLocalSearch] = useState(searchValue || "");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onSearchChange && localSearch !== searchValue) {
        onSearchChange(localSearch);
        table.setPageIndex(0); // Resetting page index when searching
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange, searchValue, table]);

  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const totalPages = table.getPageCount();

  return (
    <div className="flex flex-col gap-4">
      {onSearchChange && (
        <div className="flex items-center justify-between">
          <InputGroup className="max-w-sm">
            <InputGroupAddon>
              <InputGroupText>
                <GoSearch className="size-4" />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              placeholder={searchPlaceholder}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </InputGroup>
        </div>
      )}

      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={onRowClick ? "cursor-pointer" : undefined}
                  onClick={
                    onRowClick ? () => onRowClick(row.original) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 0 && (
        <div className="mt-4">
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageSizeChange={(newSize) => table.setPageSize(newSize)}
            onPageChange={(page) => table.setPageIndex(page - 1)}
            itemName="projects"
          />
        </div>
      )}
    </div>
  );
}

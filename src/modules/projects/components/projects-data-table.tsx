"use client";

import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { getAllProjects } from "../server/get-projects";
import { type ColumnDef, type SortingState } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
  CopyIcon,
  ExternalLinkIcon,
  MoreHorizontalIcon,
  TrashIcon,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
  Github,
  Folder,
  Calendar,
  Activity,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

import { useGetAllProjects } from "../hooks";
import { DataTable } from "@/components/ui/data-table";
import { ProjectsTableSkeleton } from "./projects-table-skeleton";
import { ProjectsTableError } from "./projects-table-error";
import config from "@/config.json";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { GoRepo, GoSync } from "react-icons/go";
import type { ProjectSelect } from "@/db/schema";
import { toast } from "sonner";

export const ProjectsDataTable = ({
  defaultLimit,
}: {
  defaultLimit?: number;
} = {}) => {
  const queryDefaults = config.app.projects.query.defaults;

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultLimit || queryDefaults.limit || 10,
  });

  const [search, setSearch] = useState(queryDefaults.search);

  const [sorting, setSorting] = useState<SortingState>([
    {
      id: queryDefaults.orderBy,
      desc: queryDefaults.orderDirection === "desc",
    },
  ]);

  const sortField = sorting[0]?.id || queryDefaults.orderBy;
  const sortDesc = sorting[0]
    ? sorting[0].desc
    : queryDefaults.orderDirection === "desc";

  const { data, isPending, isError } = useGetAllProjects({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    search: search || undefined,
    orderBy: sortField,
    orderDirection: sortDesc ? "desc" : "asc",
  });

  const queryClient = useQueryClient();
  const projects = data?.data || [];
  const totalCount = data?.total || 0;
  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  useEffect(() => {
    if (!isPending && !isError && pagination.pageIndex < pageCount - 1) {
      const nextOffset = (pagination.pageIndex + 1) * pagination.pageSize;
      queryClient.prefetchQuery({
        queryKey: queryKeys.projects.list({
          limit: pagination.pageSize,
          offset: nextOffset,
          search: search || undefined,
          orderBy: sortField,
          orderDirection: sortDesc ? "desc" : "asc",
        } as any),
        queryFn: () =>
          getAllProjects({
            limit: pagination.pageSize,
            offset: nextOffset,
            search: search || undefined,
            orderBy: sortField,
            orderDirection: sortDesc ? "desc" : "asc",
          }),
      });
    }
  }, [
    pagination.pageIndex,
    pagination.pageSize,
    search,
    sortField,
    sortDesc,
    isPending,
    isError,
    pageCount,
    queryClient,
  ]);

  const columns = useMemo<ColumnDef<ProjectSelect>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="-ml-4 hover:bg-transparent select-none flex items-center"
            >
              <Folder className="mr-2 h-4 w-4 shrink-0" />
              Project Name
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const isGithubProject = !!row.original.exportRepoUrl;
          const isImporting = row.original.importStatus === "importing";

          return (
            <div className="flex flex-row items-center gap-3">
              <div className="p-2 rounded-md bg-muted text-muted-foreground">
                {isImporting ? (
                  <Spinner className="size-4" />
                ) : isGithubProject ? (
                  <Github className="size-4" />
                ) : (
                  <GoRepo className="size-4" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">
                  {row.original.name}
                </span>
                {row.original.description && (
                  <span className="text-xs text-muted-foreground w-[200px] truncate">
                    {row.original.description}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="-ml-4 hover:bg-transparent select-none flex items-center"
            >
              <Calendar className="mr-2 h-4 w-4 shrink-0" />
              Created
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          return (
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              {formatDistanceToNow(new Date(row.original.createdAt), {
                addSuffix: true,
              })}
            </span>
          );
        },
      },
      {
        accessorKey: "importStatus",
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
              className="-ml-4 hover:bg-transparent select-none flex items-center"
            >
              <Activity className="mr-2 h-4 w-4 shrink-0" />
              Status
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => {
          const status = row.original.importStatus;
          const variants: Record<
            string,
            "default" | "secondary" | "destructive" | "outline"
          > = {
            completed: "default",
            importing: "secondary",
            failed: "destructive",
            cancelled: "outline",
          };

          return (
            <Badge
              variant={variants[status] || "outline"}
              className="capitalize"
            >
              {status}
            </Badge>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    navigator.clipboard.writeText(project.id);
                    toast.success("Project ID copied to clipboard");
                  }}
                >
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <ExternalLinkIcon className="mr-2 h-4 w-4" />
                  Open Project
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [],
  );

  if (isPending) {
    return <ProjectsTableSkeleton />;
  }

  if (isError) {
    return (
      <ProjectsTableError error={new Error("Failed to load projects table.")} />
    );
  }

  return (
    <div className="w-full">
      <DataTable
        columns={columns}
        data={projects}
        pageCount={pageCount}
        totalItems={totalCount}
        pagination={pagination}
        setPagination={setPagination}
        sorting={sorting}
        setSorting={setSorting}
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search projects..."
        onRowClick={(row) => {
          // Future use
        }}
      />
    </div>
  );
};

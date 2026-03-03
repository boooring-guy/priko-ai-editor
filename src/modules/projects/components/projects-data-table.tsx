"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { SortingState } from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import { useSetAtom } from "jotai";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  CopyIcon,
  ExternalLinkIcon,
  Folder,
  Github,
  MoreHorizontalIcon,
  PencilIcon,
  TrashIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { GoRepo } from "react-icons/go";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Spinner } from "@/components/ui/spinner";
import config from "@/config.json";
import type { ProjectSelect } from "@/db/schema";
import { queryKeys } from "@/lib/query-keys";
import { useGetAllProjects, useRenameProject } from "../hooks";
import { getAllProjects } from "../server/get-projects";
import { activeProjectAtom } from "../store/project-atoms";
import { RenameProjectModal } from "./rename-project-modal";
import { ProjectsTableError } from "./projects-table-error";
import { ProjectsTableSkeleton } from "./projects-table-skeleton";

// ── Inline-rename cell ──────────────────────────────────────────────────────

function InlineRenameCell({
  project,
  onRenameRequest,
}: {
  project: ProjectSelect;
  onRenameRequest: (project: ProjectSelect, newName: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(project.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const isGithubProject = !!project.exportRepoUrl;
  const isImporting = project.importStatus === "importing";

  const startEdit = (e: React.MouseEvent) => {
    // Prevent row-click navigation from firing
    e.stopPropagation();
    setDraft(project.name);
    setEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 30);
  };

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== project.name) {
      onRenameRequest(project, trimmed);
    }
    setEditing(false);
  };

  const cancel = () => {
    setDraft(project.name);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancel();
    }
  };

  return (
    <div className="flex flex-row items-center gap-3">
      <div className="p-2 rounded-md bg-muted text-muted-foreground shrink-0">
        {isImporting ? (
          <Spinner className="size-4" />
        ) : isGithubProject ? (
          <Github className="size-4" />
        ) : (
          <GoRepo className="size-4" />
        )}
      </div>
      <div className="flex flex-col min-w-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={handleKeyDown}
            onClick={(e) => e.stopPropagation()}
            className="font-medium text-foreground bg-transparent border-b border-primary outline-none w-full max-w-[200px] py-0.5 text-sm"
          />
        ) : (
          <span
            className="font-medium text-foreground cursor-text group/name flex items-center gap-1"
            onDoubleClick={startEdit}
            title="Double-click to rename"
          >
            {project.name}
            <PencilIcon className="size-3 opacity-0 group-hover/name:opacity-40 transition-opacity shrink-0" />
          </span>
        )}
        {project.description && (
          <span className="text-xs text-muted-foreground w-[200px] truncate">
            {project.description}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main table ──────────────────────────────────────────────────────────────

export const ProjectsDataTable = ({
  defaultLimit,
}: {
  defaultLimit?: number;
} = {}) => {
  const queryDefaults = (
    (config as any).projects || (config as any).app?.projects
  )?.query?.defaults || {
    limit: 10,
    search: "",
    orderBy: "createdAt",
    orderDirection: "desc",
  };
  const router = useRouter();
  const setActiveProject = useSetAtom(activeProjectAtom);
  const { mutateAsync: renameProject, isPending: isRenaming } =
    useRenameProject();

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

  // Rename state
  const [renameInfo, setRenameInfo] = useState<{
    project: ProjectSelect;
    pendingName: string;
  } | null>(null);

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

  const handleRenameRequest = (project: ProjectSelect, newName: string) => {
    setRenameInfo({ project, pendingName: newName });
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!renameInfo) return;
    try {
      await renameProject({ projectId: renameInfo.project.id, newName });
      toast.success(`Project renamed to "${newName}"`);
      setRenameInfo(null);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to rename project");
    }
  };

  const columns: any[] = useMemo(
    () => [
      {
        accessorKey: "name",
        accessorFn: (row: ProjectSelect) => row.name,
        header: ({ column }: { column: any }) => {
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
        cell: ({ row }: { row: { original: ProjectSelect } }) => (
          <InlineRenameCell
            project={row.original}
            onRenameRequest={handleRenameRequest}
          />
        ),
      },
      {
        accessorKey: "createdAt",
        accessorFn: (row: ProjectSelect) => row.createdAt,
        header: ({ column }: { column: any }) => {
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
        cell: ({ row }: { row: { original: ProjectSelect } }) => {
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
        accessorFn: (row: ProjectSelect) => row.importStatus,
        header: ({ column }: { column: any }) => {
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
        cell: ({ row }: { row: { original: ProjectSelect } }) => {
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
        accessorKey: "id",
        enableHiding: false,
        cell: ({ row }: { row: { original: ProjectSelect } }) => {
          const project = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontalIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(project.id);
                    toast.success("Project ID copied to clipboard");
                  }}
                >
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy ID
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenameInfo({ project, pendingName: project.name });
                  }}
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  <ExternalLinkIcon className="mr-2 h-4 w-4" />
                  Open Project
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={(e) => e.stopPropagation()}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        columns={columns as any}
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
          const username = row.owner?.username;
          if (!username) {
            toast.error(
              "Cannot open project: owner information is unavailable.",
            );
            return;
          }
          setActiveProject({
            id: row.id,
            name: row.name,
            username,
            projectname: row.name,
            updatedAt: row.updatedAt.toISOString(),
          });
          router.push(`/projects/${username}/${row.name}`);
        }}
      />

      {/* Rename warning modal */}
      <RenameProjectModal
        open={!!renameInfo}
        currentName={renameInfo?.project.name ?? ""}
        pendingName={renameInfo?.pendingName ?? ""}
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameInfo(null)}
        isPending={isRenaming}
      />
    </div>
  );
};

"use client";

import React, { useMemo, useCallback } from "react";
import {
  FileText,
  Folder,
  FolderOpen,
  Plus,
  RefreshCw,
  FolderPlus,
  Loader2,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { activeProjectAtom } from "@/modules/projects/store/project-atoms";
import {
  selectedFileIdAtom,
  pendingCreateAtom,
  pendingRenameAtom,
  flatFilesAtom,
  openFileTemporarilyAtom,
  pinFileAtom,
} from "@/modules/files/store/file-atoms";
import { buildFileTree } from "@/modules/files/shared/file-type-guards";
import type { FileNode } from "@/modules/files/shared/file-type-guards";
import { entryNameSchema } from "@/modules/files/shared/create.schema";
import {
  useGetFiles,
  useCreateFile,
  useCreateFolder,
  useDeleteFile,
  useDeleteFolder,
  useRenameFile,
  useRenameFolder,
} from "@/modules/files/hooks";
import {
  TreeView,
  type TreeDataItem,
  type TreeRenderItemParams,
} from "@/components/tree-view";
import {
  makeFileIcon,
  makeFolderIcon,
  makeFolderOpenIcon,
} from "@/lib/file-icon";
import { cn } from "@/lib/utils";
import { ExplorerContextMenu } from "./explorer-context-menu";

// ─── Path parser ──────────────────────────────────────────────────────────────

function parsePath(input: string) {
  const parts = input
    .split("/")
    .map((s) => s.trim())
    .filter(Boolean);
  const trailingSlash = input.trimEnd().endsWith("/");
  if (parts.length === 0)
    return { dirs: [] as string[], leaf: "", leafIsDir: false };
  return {
    dirs: parts.slice(0, -1),
    leaf: parts[parts.length - 1],
    leafIsDir: trailingSlash,
  };
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const createSchema = z.object({
  path: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(1000, "Too long")
    .refine(
      (v) =>
        v
          .split("/")
          .filter(Boolean)
          .every((seg) => !/[\\<>:"|?*\x00]/.test(seg)),
      "Contains invalid characters",
    ),
});
type CreateFormValues = z.infer<typeof createSchema>;

const renameSchema = z.object({ name: entryNameSchema });
type RenameFormValues = z.infer<typeof renameSchema>;

// ─── Inline create popover form ───────────────────────────────────────────────

function CreatePopoverForm({
  kind,
  parentName,
  onSubmit,
  onClose,
  isLoading,
}: {
  kind: "file" | "folder";
  parentName: string | null;
  onSubmit: (path: string) => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}) {
  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: { path: "" },
  });

  const handleSubmit = form.handleSubmit(async ({ path }) => {
    await onSubmit(path);
    form.reset();
  });

  const placeholder =
    kind === "file"
      ? "file.tsx or src/utils/file.tsx"
      : "folder or src/components";
  const isFile = kind === "file";

  // Live icon derived from the typed path (use the leaf segment)
  const watchedPath = form.watch("path");
  const leafName = watchedPath.split("/").filter(Boolean).at(-1) ?? "";
  const LiveIcon = React.useMemo(
    () =>
      leafName
        ? isFile
          ? makeFileIcon(leafName)
          : makeFolderIcon(leafName)
        : null,
    [leafName, isFile],
  );

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <p className="text-[11px] text-muted-foreground">
          {isFile ? (
            <FileText className="h-3 w-3 inline mr-1 text-blue-400" />
          ) : (
            <FolderPlus className="h-3 w-3 inline mr-1 text-yellow-500" />
          )}
          New {isFile ? "file" : "folder"}
          {parentName && (
            <span className="text-foreground/60">
              {" "}
              in{" "}
              <code className="font-mono text-[10px] bg-muted px-0.5 rounded">
                {parentName}
              </code>
            </span>
          )}
        </p>
        <FormField
          control={form.control}
          name="path"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormControl>
                <InputGroup className="h-7">
                  {LiveIcon && (
                    <InputGroupAddon align="inline-start" className="pl-2 py-0">
                      <LiveIcon className="h-3.5 w-3.5" />
                    </InputGroupAddon>
                  )}
                  <InputGroupInput
                    {...field}
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                    placeholder={placeholder}
                    className="text-xs font-mono"
                    onKeyDown={(e) => e.key === "Escape" && onClose()}
                  />
                </InputGroup>
              </FormControl>
              <FormMessage className="text-[10px]" />
            </FormItem>
          )}
        />
        <p className="text-[10px] text-muted-foreground/60">
          Use <code className="font-mono bg-muted px-0.5 rounded">/</code> for
          nested paths
        </p>
        <div className="flex justify-end">
          <ButtonGroup>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs px-3"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-7 text-xs px-3"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Create
            </Button>
          </ButtonGroup>
        </div>
      </form>
    </Form>
  );
}

// ─── Rename dialog ────────────────────────────────────────────────────────────

function RenameDialog({
  open,
  fileType,
  currentName,
  onClose,
  onSubmit,
  isLoading,
}: {
  open: boolean;
  fileType: "file" | "directory";
  currentName: string;
  onClose: () => void;
  onSubmit: (name: string) => Promise<void>;
  isLoading: boolean;
}) {
  const form = useForm<RenameFormValues>({
    resolver: zodResolver(renameSchema),
    defaultValues: { name: currentName },
  });

  React.useEffect(() => {
    if (open) form.reset({ name: currentName });
  }, [open, currentName, form]);

  const handleSubmit = form.handleSubmit(async ({ name }) => {
    await onSubmit(name);
  });

  // Live icon derived from the typed name
  const watchedName = form.watch("name");
  const LiveIcon = React.useMemo(
    () =>
      watchedName
        ? fileType === "file"
          ? makeFileIcon(watchedName)
          : makeFolderIcon(watchedName)
        : null,
    [watchedName, fileType],
  );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <Pencil className="h-3.5 w-3.5" />
            Rename {fileType === "file" ? "file" : "folder"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InputGroup>
                      {LiveIcon && (
                        <InputGroupAddon align="inline-start">
                          <LiveIcon className="h-4 w-4" />
                        </InputGroupAddon>
                      )}
                      <InputGroupInput
                        {...field}
                        autoFocus
                        autoComplete="off"
                        spellCheck={false}
                        className="font-mono text-sm"
                        onFocus={(e) => {
                          const target = e.target;
                          const val = target.value;
                          const dotIndex =
                            fileType === "file" ? val.lastIndexOf(".") : -1;
                          setTimeout(() => {
                            if (dotIndex > 0) {
                              target.setSelectionRange(0, dotIndex);
                            } else {
                              target.select();
                            }
                          }, 0);
                        }}
                      />
                    </InputGroup>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <DialogFooter>
              <ButtonGroup>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  )}
                  Rename
                </Button>
              </ButtonGroup>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Tree data conversion ─────────────────────────────────────────────────────

function toTreeData(
  nodes: FileNode[],
  renderActions: (node: FileNode) => React.ReactNode,
): TreeDataItem[] {
  return nodes.map((node) => {
    const isDir = node.fileType === "directory";
    return {
      id: node.id,
      name: node.name,
      icon: isDir ? makeFolderIcon(node.name) : makeFileIcon(node.name),
      openIcon: isDir ? makeFolderOpenIcon(node.name) : undefined,
      actions: renderActions(node),
      ...(isDir ? { children: toTreeData(node.children, renderActions) } : {}),
    } satisfies TreeDataItem;
  });
}

// ─── Build a flat lookup from id → FileNode ───────────────────────────────────

function buildNodeMap(nodes: FileNode[]): Map<string, FileNode> {
  const map = new Map<string, FileNode>();
  const walk = (list: FileNode[]) => {
    for (const n of list) {
      map.set(n.id, n);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return map;
}

// ─── ExplorerPanel ────────────────────────────────────────────────────────────

export function ExplorerPanel() {
  const activeProject = useAtomValue(activeProjectAtom);

  // ── Jotai ──────────────────────────────────────────────────────────────────
  const [selectedId, setSelectedId] = useAtom(selectedFileIdAtom);
  const [pendingCreate, setPendingCreate] = useAtom(pendingCreateAtom);
  const [pendingRename, setPendingRename] = useAtom(pendingRenameAtom);
  const setFlatFiles = useSetAtom(flatFilesAtom);
  const openTemporarily = useSetAtom(openFileTemporarilyAtom);
  const pinFile = useSetAtom(pinFileAtom);

  // ── Popover open state (per-button) ────────────────────────────────────────
  const [filePopoverOpen, setFilePopoverOpen] = React.useState(false);
  const [folderPopoverOpen, setFolderPopoverOpen] = React.useState(false);

  // ── React Query ────────────────────────────────────────────────────────────
  const {
    data: flatFiles = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useGetFiles(activeProject?.id);

  React.useEffect(() => {
    setFlatFiles(flatFiles);
  }, [flatFiles, setFlatFiles]);

  const createFile = useCreateFile();
  const createFolder = useCreateFolder();
  const deleteFile = useDeleteFile();
  const deleteFolder = useDeleteFolder();
  const renameFile = useRenameFile();
  const renameFolder = useRenameFolder();

  // ── Derived ────────────────────────────────────────────────────────────────
  const selectedNode = useMemo(
    () =>
      selectedId ? (flatFiles.find((f) => f.id === selectedId) ?? null) : null,
    [selectedId, flatFiles],
  );

  const toolbarParentId = useMemo(() => {
    if (!selectedNode) return null;
    return selectedNode.fileType === "directory"
      ? selectedNode.id
      : (selectedNode.parentId ?? null);
  }, [selectedNode]);

  const toolbarParentName = useMemo(
    () =>
      toolbarParentId
        ? (flatFiles.find((f) => f.id === toolbarParentId)?.name ?? null)
        : null,
    [toolbarParentId, flatFiles],
  );

  const pendingRenameNode = useMemo(
    () =>
      pendingRename
        ? {
            fileType: pendingRename.fileType,
            currentName: pendingRename.currentName,
          }
        : null,
    [pendingRename],
  );

  // ── Path-based create ──────────────────────────────────────────────────────
  const handleConfirmCreate = useCallback(
    async (
      rawPath: string,
      kind: "file" | "folder",
      parentId: string | null,
    ) => {
      if (!activeProject) return;
      const { dirs, leaf, leafIsDir } = parsePath(rawPath);
      let currentParentId: string | null = parentId;

      for (const dirName of dirs) {
        // ── Upsert: reuse existing folder rather than creating a duplicate ──
        const existing = flatFiles.find(
          (f) =>
            f.fileType === "directory" &&
            f.name === dirName &&
            (f.parentId ?? null) === currentParentId,
        );

        if (existing) {
          currentParentId = existing.id;
        } else {
          const created = await createFolder.mutateAsync({
            name: dirName,
            projectId: activeProject.id,
            parentId: currentParentId,
          });
          currentParentId = created.id;
        }
      }

      if (!leaf) return;

      // In folder mode the leaf is always a folder.
      // In file mode, a trailing slash forces a folder; otherwise it's a file.
      const effectiveKind =
        kind === "folder" ? "folder" : leafIsDir ? "folder" : "file";

      if (effectiveKind === "folder") {
        await createFolder.mutateAsync({
          name: leaf,
          projectId: activeProject.id,
          parentId: currentParentId,
        });
      } else {
        await createFile.mutateAsync({
          name: leaf,
          projectId: activeProject.id,
          fileType: "file",
          contentType: "text",
          content: null,
          parentId: currentParentId,
        });
      }
    },
    [activeProject, createFile, createFolder],
  );

  // ── Rename ─────────────────────────────────────────────────────────────────
  const handleConfirmRename = useCallback(
    async (name: string) => {
      if (!pendingRename) return;
      const input = {
        id: pendingRename.id,
        projectId: pendingRename.projectId,
        name,
      };
      if (pendingRename.fileType === "directory") {
        await renameFolder.mutateAsync(input);
      } else {
        await renameFile.mutateAsync(input);
      }
      setPendingRename(null);
    },
    [pendingRename, renameFile, renameFolder, setPendingRename],
  );

  // ── Node actions ───────────────────────────────────────────────────────────
  const renderNodeActions = useCallback(
    (node: FileNode): React.ReactNode => {
      if (!activeProject) return null;
      const isDir = node.fileType === "directory";
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="p-0.5 rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs w-40">
            {isDir && (
              <>
                <DropdownMenuItem
                  className="text-xs gap-2"
                  onSelect={() => {
                    setSelectedId(node.id);
                    setPendingCreate({ kind: "file", parentId: node.id });
                  }}
                >
                  <Plus className="h-3.5 w-3.5" /> New File Inside
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs gap-2"
                  onSelect={() => {
                    setSelectedId(node.id);
                    setPendingCreate({ kind: "folder", parentId: node.id });
                  }}
                >
                  <FolderPlus className="h-3.5 w-3.5" /> New Folder Inside
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem
              className="text-xs gap-2"
              onSelect={() =>
                setPendingRename({
                  id: node.id,
                  projectId: activeProject.id,
                  currentName: node.name,
                  fileType: node.fileType as "file" | "directory",
                })
              }
            >
              <Pencil className="h-3.5 w-3.5" /> Rename
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs gap-2 text-destructive focus:text-destructive"
              onSelect={() =>
                isDir
                  ? deleteFolder.mutate({
                      id: node.id,
                      projectId: activeProject.id,
                    })
                  : deleteFile.mutate({
                      id: node.id,
                      projectId: activeProject.id,
                    })
              }
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    [
      activeProject,
      deleteFile,
      deleteFolder,
      setSelectedId,
      setPendingCreate,
      setPendingRename,
    ],
  );

  // ── Context-menu style node create (used from ⋯ menu) ─────────────────────
  // When pendingCreate is set from a node context menu — show a Popover-like
  // overlay at the top of the tree for the nested create.
  const pendingCreateParentName = useMemo(
    () =>
      pendingCreate?.parentId
        ? (flatFiles.find((f) => f.id === pendingCreate.parentId)?.name ?? null)
        : null,
    [pendingCreate, flatFiles],
  );

  const tree = useMemo(() => buildFileTree(flatFiles), [flatFiles]);
  const treeData = useMemo(
    () => toTreeData(tree, renderNodeActions),
    [tree, renderNodeActions],
  );

  // Node map: id → FileNode — used by renderItem to wrap rows in context menu
  const nodeMap = useMemo(() => buildNodeMap(tree), [tree]);

  // renderItem: replaces default row with ExplorerContextMenu wrapper
  const renderItem = useCallback(
    ({
      item,
      isLeaf,
      isOpen,
      isSelected,
    }: TreeRenderItemParams): React.ReactNode => {
      const node = nodeMap.get(item.id);
      if (!node || !activeProject)
        return <span className="text-sm truncate">{item.name}</span>;

      const isDir = node.fileType === "directory";
      const IconComp = isOpen && item.openIcon ? item.openIcon : item.icon;

      const rowContent = (
        <>
          {IconComp && <IconComp className="h-4 w-4 shrink-0 mr-1" />}
          <span className={cn("text-sm truncate", isSelected && "font-medium")}>
            {item.name}
          </span>
          {/* Keep the ⋯ hover dropdown for quick access */}
          <div
            className={cn(
              isSelected ? "block" : "hidden",
              "absolute right-3 group-hover:block",
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {item.actions}
          </div>
        </>
      );

      return (
        <ExplorerContextMenu node={node} projectId={activeProject.id}>
          <div className="flex items-center w-full min-w-0 h-full flex-1">
            {rowContent}
          </div>
        </ExplorerContextMenu>
      );
    },
    [nodeMap, activeProject],
  );

  const isCreating = createFile.isPending || createFolder.isPending;
  const isRenaming = renameFile.isPending || renameFolder.isPending;

  return (
    <>
      {/* Rename dialog — only rename stays as dialog since it needs current name */}
      <RenameDialog
        open={!!pendingRename}
        fileType={pendingRenameNode?.fileType ?? "file"}
        currentName={pendingRenameNode?.currentName ?? ""}
        onClose={() => setPendingRename(null)}
        onSubmit={handleConfirmRename}
        isLoading={isRenaming}
      />

      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Toolbar ─────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Files
          </span>
          <div className="flex items-center gap-0.5">
            {/* New File popover */}
            <Popover open={filePopoverOpen} onOpenChange={setFilePopoverOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title={
                    toolbarParentName
                      ? `New File in "${toolbarParentName}"`
                      : "New File"
                  }
                  className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-72 p-3">
                <CreatePopoverForm
                  kind="file"
                  parentName={toolbarParentName}
                  isLoading={isCreating}
                  onClose={() => setFilePopoverOpen(false)}
                  onSubmit={async (path) => {
                    await handleConfirmCreate(path, "file", toolbarParentId);
                    setFilePopoverOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* New Folder popover */}
            <Popover
              open={folderPopoverOpen}
              onOpenChange={setFolderPopoverOpen}
            >
              <PopoverTrigger asChild>
                <button
                  type="button"
                  title={
                    toolbarParentName
                      ? `New Folder in "${toolbarParentName}"`
                      : "New Folder"
                  }
                  className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <FolderPlus className="h-3.5 w-3.5" />
                </button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="end" className="w-72 p-3">
                <CreatePopoverForm
                  kind="folder"
                  parentName={toolbarParentName}
                  isLoading={isCreating}
                  onClose={() => setFolderPopoverOpen(false)}
                  onSubmit={async (path) => {
                    await handleConfirmCreate(path, "folder", toolbarParentId);
                    setFolderPopoverOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>

            <button
              type="button"
              title="Refresh"
              onClick={() => refetch()}
              className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
              />
            </button>
          </div>
        </div>

        {/* ── Context-menu triggered create (nested inside a folder) ──────── */}
        {pendingCreate && (
          <div className="shrink-0 border-b border-border/30 bg-muted/20 px-3 py-2">
            <CreatePopoverForm
              kind={pendingCreate.kind}
              parentName={pendingCreateParentName}
              isLoading={isCreating}
              onClose={() => setPendingCreate(null)}
              onSubmit={async (path) => {
                await handleConfirmCreate(
                  path,
                  pendingCreate.kind,
                  pendingCreate.parentId,
                );
                setPendingCreate(null);
              }}
            />
          </div>
        )}

        {/* ── Tree ────────────────────────────────────────────────────────── */}
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full">
            {!activeProject && (
              <p className="text-xs text-muted-foreground text-center mt-8 px-4">
                No project open
              </p>
            )}
            {activeProject && isLoading && (
              <div className="flex items-center justify-center gap-2 mt-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs">Loading files…</span>
              </div>
            )}
            {activeProject && isError && (
              <p className="text-xs text-destructive text-center mt-8 px-4">
                {error instanceof Error
                  ? error.message
                  : "Failed to load files"}
              </p>
            )}
            {activeProject &&
              !isLoading &&
              !isError &&
              treeData.length === 0 &&
              !pendingCreate && (
                <div className="flex flex-col items-center gap-3 mt-12 px-4">
                  <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
                    <FolderOpen className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    No files yet
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilePopoverOpen(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Create your first file
                  </button>
                </div>
              )}
            {activeProject && !isLoading && !isError && treeData.length > 0 && (
              <TreeView
                data={treeData}
                className="text-xs"
                initialSelectedItemId={selectedId}
                onSelectChange={(item) => {
                  setSelectedId(item?.id);
                  // Open file as temporary tab on single-click (skip directories)
                  if (item) {
                    const node = nodeMap.get(item.id);
                    if (node && node.fileType !== "directory") {
                      openTemporarily(item.id);
                    }
                  }
                }}
                onItemDoubleClick={(item) => {
                  // Pin file as permanent tab on double-click (skip directories)
                  const node = nodeMap.get(item.id);
                  if (node && node.fileType !== "directory") {
                    pinFile(item.id);
                  }
                }}
                renderItem={renderItem}
              />
            )}
          </ScrollArea>
        </div>
      </div>
    </>
  );
}

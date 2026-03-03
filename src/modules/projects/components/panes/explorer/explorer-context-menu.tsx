"use client";

import React from "react";
import {
  FolderOpen,
  Pencil,
  Trash2,
  Scissors,
  Copy,
  ClipboardPaste,
  GitBranch,
  Plus,
  FolderPlus,
  FolderGit2,
} from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import { toast } from "sonner";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  clipboardAtom,
  pendingRenameAtom,
  pendingCreateAtom,
} from "@/modules/files/store/file-atoms";
import { useDeleteFile, useDeleteFolder } from "@/modules/files/hooks";
import type { FileNode } from "@/modules/files/shared/file-type-guards";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ExplorerContextMenuProps {
  node: FileNode;
  projectId: string;
  children: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ExplorerContextMenu({
  node,
  projectId,
  children,
}: ExplorerContextMenuProps) {
  const isDir = node.fileType === "directory";

  // ── Jotai ──────────────────────────────────────────────────────────────────
  const [clipboard, setClipboard] = useAtom(clipboardAtom);
  const [, setPendingRename] = useAtom(pendingRenameAtom);
  const [, setPendingCreate] = useAtom(pendingCreateAtom);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const deleteFile = useDeleteFile();
  const deleteFolder = useDeleteFolder();

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleOpen = () => {
    toast.info(`Open: coming soon`, {
      description: node.name,
    });
  };

  const handleRename = () => {
    setPendingRename({
      id: node.id,
      projectId,
      currentName: node.name,
      fileType: node.fileType as "file" | "directory",
    });
  };

  const handleDelete = () => {
    const label = isDir ? "folder" : "file";
    if (isDir) {
      deleteFolder.mutate(
        { id: node.id, projectId },
        {
          onSuccess: () =>
            toast.success(`Deleted folder "${node.name}"`, {
              description: "The folder and its contents have been removed.",
            }),
          onError: (err) =>
            toast.error(`Failed to delete folder`, {
              description: err instanceof Error ? err.message : undefined,
            }),
        },
      );
    } else {
      deleteFile.mutate(
        { id: node.id, projectId },
        {
          onSuccess: () => toast.success(`Deleted ${label} "${node.name}"`),
          onError: (err) =>
            toast.error(`Failed to delete ${label}`, {
              description: err instanceof Error ? err.message : undefined,
            }),
        },
      );
    }
  };

  const handleCut = () => {
    setClipboard({
      mode: "cut",
      fileId: node.id,
      fileName: node.name,
      projectId,
      fileType: node.fileType as "file" | "directory",
    });
    toast.success(`Cut: ${node.name}`, {
      description: "Item ready to paste.",
    });
  };

  const handleCopy = () => {
    setClipboard({
      mode: "copy",
      fileId: node.id,
      fileName: node.name,
      projectId,
      fileType: node.fileType as "file" | "directory",
    });
    toast.success(`Copied: ${node.name}`, {
      description: "Item ready to paste.",
    });
  };

  const handlePaste = () => {
    if (!clipboard) {
      toast.info("Nothing on clipboard.");
      return;
    }
    toast.info(`Paste: coming soon`, {
      description: `Would paste "${clipboard.fileName}" (${clipboard.mode})`,
    });
  };

  const handleGitHistory = () => {
    toast.info("Git History: coming soon", {
      description: node.name,
    });
  };

  const handleNewFileInside = () => {
    setPendingCreate({ kind: "file", parentId: node.id });
  };

  const handleNewFolderInside = () => {
    setPendingCreate({ kind: "folder", parentId: node.id });
  };

  const hasClipboard = clipboard !== null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-52 text-xs">
        {/* Label */}
        <ContextMenuLabel className="text-[10px] text-muted-foreground truncate max-w-[180px]">
          {isDir ? "Folder" : "File"} · {node.name}
        </ContextMenuLabel>
        <ContextMenuSeparator />

        {/* Folder-specific: create inside */}
        {isDir && (
          <>
            <ContextMenuItem
              className="text-xs gap-2"
              onSelect={handleNewFileInside}
            >
              <Plus className="h-3.5 w-3.5" />
              New File Inside
            </ContextMenuItem>
            <ContextMenuItem
              className="text-xs gap-2"
              onSelect={handleNewFolderInside}
            >
              <FolderPlus className="h-3.5 w-3.5" />
              New Folder Inside
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}

        {/* Open */}
        <ContextMenuItem className="text-xs gap-2" onSelect={handleOpen}>
          <FolderOpen className="h-3.5 w-3.5" />
          Open
          <ContextMenuShortcut>↵</ContextMenuShortcut>
        </ContextMenuItem>

        {/* Rename */}
        <ContextMenuItem className="text-xs gap-2" onSelect={handleRename}>
          <Pencil className="h-3.5 w-3.5" />
          Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>

        {/* Delete */}
        <ContextMenuItem
          className="text-xs gap-2 text-destructive focus:text-destructive"
          variant="destructive"
          onSelect={handleDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Cut / Copy / Paste */}
        <ContextMenuItem className="text-xs gap-2" onSelect={handleCut}>
          <Scissors className="h-3.5 w-3.5" />
          Cut
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem className="text-xs gap-2" onSelect={handleCopy}>
          <Copy className="h-3.5 w-3.5" />
          Copy
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          className="text-xs gap-2"
          onSelect={handlePaste}
          disabled={!hasClipboard}
        >
          <ClipboardPaste className="h-3.5 w-3.5" />
          Paste
          {hasClipboard && clipboard && (
            <span className="ml-1 text-[10px] text-muted-foreground truncate max-w-[60px]">
              {clipboard.mode === "cut" ? "✂" : "⎘"} {clipboard.fileName}
            </span>
          )}
          <ContextMenuShortcut>⌘V</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Git History */}
        <ContextMenuItem className="text-xs gap-2" onSelect={handleGitHistory}>
          <FolderGit2 className="h-3.5 w-3.5" />
          Git History
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

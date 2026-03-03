import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type PendingCreate =
  | { kind: "file"; parentId: string | null }
  | { kind: "folder"; parentId: string | null }
  | null;

export type PendingRename = {
  id: string;
  projectId: string;
  currentName: string;
  fileType: "file" | "directory";
} | null;

export type ClipboardEntry = {
  mode: "cut" | "copy";
  fileId: string;
  fileName: string;
  projectId: string;
  fileType: "file" | "directory";
} | null;

// ─── Atoms ────────────────────────────────────────────────────────────────────

/**
 * The currently selected file/folder ID in the explorer tree.
 * Used by toolbar buttons to determine where to create new files.
 */
export const selectedFileIdAtom = atom<string | undefined>(undefined);

/**
 * Pending inline-create operation.
 * When non-null an InlineNameInput is shown for file or folder creation.
 */
export const pendingCreateAtom = atom<PendingCreate>(null);

/**
 * Pending inline-rename operation.
 * When non-null an InlineNameInput pre-filled with the current name is shown.
 */
export const pendingRenameAtom = atom<PendingRename>(null);

/**
 * Per-project map of expanded folder IDs in the file tree explorer.
 * Keyed by projectId → string[] (JSON-serializable) so the open/collapsed
 * state persists across page refreshes via localStorage.
 */
export const treeExpandedAtom = atomWithStorage<Record<string, string[]>>(
  "priko:tree-expanded",
  {},
);

/**
 * The flat list of DB files for the current project.
 * Stored here so any pane (e.g. editor, breadcrumbs) can look up file metadata
 * without re-fetching.
 *
 * NOTE: the source of truth is React Query; this atom is set as a side-effect
 * of the `useGetFiles` query result inside the ExplorerPanel.
 */
export const flatFilesAtom = atom<
  { id: string; name: string; parentId: string | null; fileType: string }[]
>([]);

/**
 * Cut/Copy clipboard state for file explorer.
 * Stores the last item the user cut or copied so Paste can act on it.
 */
export const clipboardAtom = atom<ClipboardEntry>(null);

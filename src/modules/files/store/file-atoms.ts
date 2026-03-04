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

// ─── Editor Tabs ──────────────────────────────────────────────────────────────

/** Minimal info tracked per open editor tab. */
export type EditorTab = {
  fileId: string;
  /** false = temporary (preview), true = permanent (pinned) */
  isPinned: boolean;
};

/**
 * Per-project map of open editor tabs, persisted to localStorage.
 * Keyed by projectId → EditorTab[].
 */
export const openTabsMapAtom = atomWithStorage<Record<string, EditorTab[]>>(
  "priko:open-tabs",
  {},
);

/**
 * Per-project map of the active (visible) tab file ID. Persisted.
 * Keyed by projectId → string | null.
 */
export const activeTabIdMapAtom = atomWithStorage<
  Record<string, string | null>
>("priko:active-tab", {});

/* ── Derived atoms scoped to a given project ─────────────────────────────── */

import { activeProjectAtom } from "@/modules/projects/store/project-atoms";

/** Ordered list of open tabs for the current project. */
export const openTabsAtom = atom(
  (get) => {
    const pid = get(activeProjectAtom)?.id;
    if (!pid) return [] as EditorTab[];
    return get(openTabsMapAtom)[pid] ?? [];
  },
  (get, set, tabs: EditorTab[]) => {
    const pid = get(activeProjectAtom)?.id;
    if (!pid) return;
    set(openTabsMapAtom, { ...get(openTabsMapAtom), [pid]: tabs });
  },
);

/** File ID of the currently active tab for the current project. */
export const activeTabIdAtom = atom(
  (get) => {
    const pid = get(activeProjectAtom)?.id;
    if (!pid) return null;
    return get(activeTabIdMapAtom)[pid] ?? null;
  },
  (get, set, fileId: string | null) => {
    const pid = get(activeProjectAtom)?.id;
    if (!pid) return;
    set(activeTabIdMapAtom, { ...get(activeTabIdMapAtom), [pid]: fileId });
  },
);

/**
 * Open a file as a **temporary (preview)** tab — triggered on single-click.
 *
 * 1. Already open (temp OR pinned) → just activate it.
 * 2. A temp tab exists → replace it with this file, activate.
 * 3. No temp tab → append a new temp tab, activate.
 */
export const openFileTemporarilyAtom = atom(
  null,
  (get, set, fileId: string) => {
    const tabs = get(openTabsAtom);
    const existing = tabs.find((t) => t.fileId === fileId);

    if (existing) {
      // Already open — just switch to it
      set(activeTabIdAtom, fileId);
      return;
    }

    const tempIdx = tabs.findIndex((t) => !t.isPinned);

    if (tempIdx !== -1) {
      // Replace the existing temp tab
      const next = [...tabs];
      next[tempIdx] = { fileId, isPinned: false };
      set(openTabsAtom, next);
    } else {
      // No temp tab — append
      set(openTabsAtom, [...tabs, { fileId, isPinned: false }]);
    }

    set(activeTabIdAtom, fileId);
  },
);

/**
 * Pin a file as a **permanent** tab — triggered on double-click.
 *
 * 1. Already open & pinned → just activate.
 * 2. Already open & temp → flip to pinned, activate.
 * 3. Not open → append as pinned, activate.
 */
export const pinFileAtom = atom(null, (get, set, fileId: string) => {
  const tabs = get(openTabsAtom);
  const idx = tabs.findIndex((t) => t.fileId === fileId);

  if (idx !== -1) {
    if (!tabs[idx].isPinned) {
      const next = [...tabs];
      next[idx] = { ...next[idx], isPinned: true };
      set(openTabsAtom, next);
    }
  } else {
    set(openTabsAtom, [...tabs, { fileId, isPinned: true }]);
  }

  set(activeTabIdAtom, fileId);
});

/**
 * Close a tab — future use from the tab bar UI.
 *
 * Removes the tab. If it was the active tab, activates the nearest neighbour.
 */
export const closeTabAtom = atom(null, (get, set, fileId: string) => {
  const tabs = get(openTabsAtom);
  const idx = tabs.findIndex((t) => t.fileId === fileId);
  if (idx === -1) return;

  const next = tabs.filter((t) => t.fileId !== fileId);
  set(openTabsAtom, next);

  // If we just closed the active tab, pick a neighbour
  if (get(activeTabIdAtom) === fileId) {
    if (next.length === 0) {
      set(activeTabIdAtom, null);
    } else {
      const newIdx = Math.min(idx, next.length - 1);
      set(activeTabIdAtom, next[newIdx].fileId);
    }
  }
});

/**
 * Close all open tabs for the current project.
 */
export const closeAllTabsAtom = atom(null, (get, set) => {
  set(openTabsAtom, []);
  set(activeTabIdAtom, null);
});

import { atom } from "jotai";

/**
 * Tracks which files have unsaved changes in the editor.
 * Keyed by `fileId` -> boolean.
 *
 * Used to show the dirty dot on tabs and prompt before closing,
 * as well as by the global save shortcut.
 */
export const editorDirtyAtom = atom<Record<string, boolean>>({});

/**
 * Helper to mark a file as dirty (unsaved) or clean (saved).
 */
export const setFileDirtyAtom = atom(
  null,
  (get, set, fileId: string, isDirty: boolean) => {
    const current = get(editorDirtyAtom);
    if (current[fileId] === isDirty) return;

    set(editorDirtyAtom, {
      ...current,
      [fileId]: isDirty,
    });
  },
);

/**
 * Helper to check if a file is currently dirty.
 */
export const isFileDirtyAtom = atom((get) => (fileId: string) => {
  return get(editorDirtyAtom)[fileId] ?? false;
});

/**
 * Stores the actual unsaved text content for a given file.
 * Keyed by `fileId` -> string (draft content).
 *
 * This allows us to switch tabs without losing unsaved work.
 */
export const editorDraftsAtom = atom<Record<string, string>>({});

/**
 * Helper to set or clear the draft content for a file.
 * Also automatically updates the dirty flag if the content has changed
 * from what the database holds (or simply passing true if we have a draft).
 */
export const setFileDraftAtom = atom(
  null,
  (get, set, fileId: string, draftContent: string | null) => {
    const drafts = get(editorDraftsAtom);

    if (draftContent === null) {
      // Clear draft
      const newDrafts = { ...drafts };
      delete newDrafts[fileId];
      set(editorDraftsAtom, newDrafts);

      // Also mark as not dirty because it's cleared/saved
      set(setFileDirtyAtom, fileId, false);
    } else {
      // Set draft
      if (drafts[fileId] !== draftContent) {
        set(editorDraftsAtom, {
          ...drafts,
          [fileId]: draftContent,
        });
      }

      // Mark as dirty
      set(setFileDirtyAtom, fileId, true);
    }
  },
);

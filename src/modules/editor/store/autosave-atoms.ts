import { atom } from "jotai";
import { userConfigAtom } from "@/modules/config/store/config-atoms";
import { editorDirtyAtom } from "./editor-atoms";

/**
 * Tracks whether autosave is currently persisting files.
 * Set to true at the start of a save pass, false on completion.
 */
export const autosaveSavingAtom = atom(false);

/**
 * Derived sync status for the UI badge.
 * - "saving"  → autosave is actively writing to the server
 * - "unsaved" → one or more files have unsaved changes
 * - "saved"   → everything is clean
 */
export type SyncStatus = "saved" | "saving" | "unsaved";

export const autosaveSyncStatusAtom = atom<SyncStatus>((get) => {
  if (get(autosaveSavingAtom)) return "saving";

  const dirty = get(editorDirtyAtom);
  const hasDirty = Object.values(dirty).some(Boolean);
  if (hasDirty) return "unsaved";

  return "saved";
});

/**
 * Whether autosave is enabled.
 * Derived from the central userConfigAtom (synced to DB).
 */
export const autosaveEnabledAtom = atom<boolean>(
  (get) => get(userConfigAtom).app.editor.autosave.enabled,
);

/**
 * Autosave interval in milliseconds.
 * Derived from the central userConfigAtom (synced to DB).
 */
export const autosaveIntervalAtom = atom<number>(
  (get) => get(userConfigAtom).app.editor.autosave.intervalMs,
);

/**
 * Whether to autosave when the window loses focus.
 * Derived from the central userConfigAtom (synced to DB).
 */
export const autosaveOnFocusLossAtom = atom<boolean>(
  (get) => get(userConfigAtom).app.editor.autosave.onFocusLoss,
);

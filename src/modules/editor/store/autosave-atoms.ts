import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import config from "@/config.json";
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
 * Persisted per-user in localStorage; defaults from config.json.
 */
export const autosaveEnabledAtom = atomWithStorage<boolean>(
  "priko:autosave-enabled",
  config.app.editor.autosave.enabled,
);

/**
 * Autosave interval in milliseconds.
 * Persisted per-user in localStorage; defaults from config.json.
 */
export const autosaveIntervalAtom = atomWithStorage<number>(
  "priko:autosave-interval",
  config.app.editor.autosave.intervalMs,
);

/**
 * Whether to autosave when the window loses focus.
 * Persisted per-user in localStorage; defaults from config.json.
 */
export const autosaveOnFocusLossAtom = atomWithStorage<boolean>(
  "priko:autosave-on-focus-loss",
  config.app.editor.autosave.onFocusLoss,
);

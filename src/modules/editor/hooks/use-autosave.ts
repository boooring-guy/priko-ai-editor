"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  editorDirtyAtom,
  editorDraftsAtom,
  setFileDraftAtom,
} from "../store/editor-atoms";
import {
  autosaveEnabledAtom,
  autosaveIntervalAtom,
  autosaveOnFocusLossAtom,
  autosaveSavingAtom,
} from "../store/autosave-atoms";
import { updateFile } from "@/modules/files/server/update";

/**
 * Autosave hook – saves all dirty files automatically.
 *
 * - Debounced: waits for `intervalMs` of editor inactivity before saving.
 *   Every time dirty state changes the timer resets, so it only fires once
 *   the user stops typing for the configured duration.
 * - Focus-loss: saves immediately when the browser tab/window loses focus.
 * - Silent: calls the server action directly (no React Query invalidation),
 *   so the editor cursor position is never disturbed.
 *
 * Call this once per mounted editor area (e.g. inside CodeEditorInner).
 */
export function useAutosave({ projectId }: { projectId: string }) {
  const enabled = useAtomValue(autosaveEnabledAtom);
  const intervalMs = useAtomValue(autosaveIntervalAtom);
  const onFocusLoss = useAtomValue(autosaveOnFocusLossAtom);

  const dirtyMap = useAtomValue(editorDirtyAtom);
  const drafts = useAtomValue(editorDraftsAtom);
  const setDraft = useSetAtom(setFileDraftAtom);
  const setSaving = useSetAtom(autosaveSavingAtom);

  // Keep mutable refs so callbacks always read fresh values
  const dirtyRef = useRef(dirtyMap);
  const draftsRef = useRef(drafts);
  dirtyRef.current = dirtyMap;
  draftsRef.current = drafts;

  // Track in-flight saves to avoid duplicate requests
  const savingRef = useRef(false);

  // Debounce timer ref
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveAllDirty = useCallback(async () => {
    if (savingRef.current) return;

    const dirty = dirtyRef.current;
    const currentDrafts = draftsRef.current;

    // Collect file IDs that are dirty AND have draft content
    const toSave = Object.entries(dirty)
      .filter(([fileId, isDirty]) => isDirty && currentDrafts[fileId] != null)
      .map(([fileId]) => fileId);

    if (toSave.length === 0) return;

    savingRef.current = true;
    setSaving(true);

    try {
      await Promise.all(
        toSave.map(async (fileId) => {
          const content = currentDrafts[fileId];
          if (content == null) return; // guard against race

          // Call server action directly — no query invalidation,
          // so the editor document & cursor are untouched.
          await updateFile({ id: fileId, projectId, content });
          // Clear draft + dirty flag on success
          setDraft(fileId, null);
        }),
      );
    } catch (err) {
      // Silently fail – the user can still Cmd+S manually.
      console.error("[autosave] failed:", err);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }, [projectId, setDraft, setSaving]);

  // ── Debounced autosave: restart timer every time dirty state changes ─────
  useEffect(() => {
    if (!enabled) return;

    // If nothing is dirty, no need to schedule
    const hasDirty = Object.values(dirtyMap).some(Boolean);
    if (!hasDirty) return;

    // Clear any existing timer and start a new one
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      saveAllDirty();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled, intervalMs, dirtyMap, saveAllDirty]);

  // ── Focus-loss autosave ───────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !onFocusLoss) return;

    const handleBlur = () => {
      saveAllDirty();
    };

    window.addEventListener("blur", handleBlur);
    return () => window.removeEventListener("blur", handleBlur);
  }, [enabled, onFocusLoss, saveAllDirty]);
}

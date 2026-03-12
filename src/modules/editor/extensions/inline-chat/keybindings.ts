/**
 * Inline Chat — Keyboard Shortcuts
 *
 * Defines the key bindings that control the inline chat lifecycle:
 *  - Mod-k     → Open the inline chat prompt at the cursor
 *  - Escape    → Dismiss the prompt or reject the preview
 *  - Mod-Enter → Accept the generated code preview
 *
 * Each command checks the current phase of the inline chat state field
 * before acting, returning `false` (unhandled) if the command doesn't
 * apply in the current phase.
 */

import { Prec } from "@codemirror/state";
import { keymap, EditorView } from "@codemirror/view";
import {
  inlineChatField,
  openPromptEffect,
  closePromptEffect,
  acceptCodeEffect,
  rejectCodeEffect,
} from "./state";

// ── Command: Open the inline chat prompt ────────────────────────────────

function openInlineChat(view: EditorView): boolean {
  const state = view.state.field(inlineChatField);

  // Don't open if already active
  if (state.phase !== "idle") return false;

  const selection = view.state.selection.main;
  const line = view.state.doc.lineAt(selection.head);

  // Determine the range to operate on:
  // - If user has a selection, use that range
  // - Otherwise, use the entire current line
  const from = selection.empty ? line.from : selection.from;
  const to = selection.empty ? line.to : selection.to;
  const originalCode = view.state.sliceDoc(from, to);

  view.dispatch({
    effects: openPromptEffect.of({
      anchorLine: line.number,
      from,
      to,
      originalCode,
    }),
  });

  return true;
}

// ── Command: Dismiss prompt or reject preview ───────────────────────────

function dismissInlineChat(view: EditorView): boolean {
  const state = view.state.field(inlineChatField);

  if (state.phase === "prompting" || state.phase === "loading") {
    view.dispatch({ effects: closePromptEffect.of(undefined) });
    return true;
  }

  if (state.phase === "preview") {
    view.dispatch({ effects: rejectCodeEffect.of(undefined) });
    return true;
  }

  return false; // Not handled — let other keymaps process Escape
}

// ── Command: Accept the generated code ──────────────────────────────────

function acceptInlineChat(view: EditorView): boolean {
  const state = view.state.field(inlineChatField);

  if (state.phase !== "preview") return false;

  // Insert the generated code, replacing the original range
  view.dispatch({
    changes: {
      from: state.from,
      to: state.to,
      insert: state.generatedCode,
    },
    effects: acceptCodeEffect.of(undefined),
  });

  return true;
}

// ── Keymap — bound at highest precedence to override defaults ───────────

export const inlineChatKeymap = Prec.highest(
  keymap.of([
    { key: "Mod-k", run: openInlineChat },
    { key: "Escape", run: dismissInlineChat },
    { key: "Mod-Enter", run: acceptInlineChat },
  ]),
);

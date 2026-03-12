import { keymap } from "@codemirror/view";
import { StateCommand, EditorState } from "@codemirror/state";
import { openQuickEditEffect } from "./state";
import { quickEditField } from "./state";

/**
 * Triggers the Quick Edit menu on the current selection.
 */
export const openQuickEditCommand: StateCommand = ({ state, dispatch }) => {
  const current = state.field(quickEditField);
  
  // If we're already prompting or active, maybe close it or do nothing
  if (current.phase !== "idle") {
    // optional: toggle it off
    return false;
  }

  // Get the main selection
  const selection = state.selection.main;
  
  // If no selection, we *could* block it. But let's just use the current cursor.
  // Although Quick Edit usually works best WITH a selection.
  const from = selection.from;
  const to = selection.to;
  
  if (from === to) {
      // User hasn't selected anything. In a "Quick Edit" feature, we might require selection 
      // or we just expand to the current line. For this implementation, we allow cursor position or selection.
  }

  const selectionText = state.sliceDoc(from, to);

  dispatch(
    state.update({
      effects: [openQuickEditEffect.of({
        from,
        to,
        selectionText
      })],
    })
  );

  return true;
};

// Bind to Cmd+Shift+K on Mac, Ctrl+Shift+K on Windows
export const quickEditKeymap = keymap.of([
  {
    key: "Mod-Shift-k",
    run: openQuickEditCommand,
    preventDefault: true,
  },
]);

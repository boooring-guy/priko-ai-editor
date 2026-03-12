import { EditorView } from "@codemirror/view";
import { openQuickEditEffect, closeQuickEditEffect, quickEditField } from "./state";

/**
 * An update listener that watches for selection changes.
 * If the user selects a significant amount of text, we automatically
 * open the Quick Edit prompt.
 */
export const quickEditSelectionObserver = EditorView.updateListener.of((update) => {
  if (!update.selectionSet) return;

  const state = update.state;
  const mainSelection = state.selection.main;
  const quickEditState = state.field(quickEditField);

  // If we're already active (prompting, loading, preview), don't auto-close or auto-open
  // unless the user clicks away. But for now, let's keep it simple:
  // If they are in "idle" phase, and they make a selection of at least a few characters, open it.
  
  // Also, we don't want to violently close it if they are typing in the prompt.
  // The prompt widget input handles its own events so it shouldn't trigger this selectionSet
  // randomly, but just in case, we only interact if we are idle or if it was auto-opened.

  const isSignificantSelection = mainSelection.to - mainSelection.from > 2;

  if (isSignificantSelection) {
    if (quickEditState.phase === "idle" || (quickEditState.phase === "prompting" && quickEditState.autoOpen)) {
      const selectionText = state.sliceDoc(mainSelection.from, mainSelection.to);
      
      // We don't dispatch immediately in the update listener if we can avoid it,
      // but CodeMirror allows effects in update listeners if dispatched asynchronously,
      // or directly if it doesn't cause a loop. 
      // Safest way is to dispatch in a microtask to avoid recursive updates.
      queueMicrotask(() => {
        update.view.dispatch({
          effects: [openQuickEditEffect.of({
            from: mainSelection.from,
            to: mainSelection.to,
            selectionText,
            auto: true
          })]
        });
      });
    }
  } else {
    // If the selection is cleared (just a cursor), and we were auto-opened, we close it.
    if (quickEditState.phase === "prompting" && quickEditState.autoOpen) {
      queueMicrotask(() => {
        update.view.dispatch({
          effects: [closeQuickEditEffect.of(undefined)]
        });
      });
    }
  }
});

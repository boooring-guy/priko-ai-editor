import { EditorView } from "@codemirror/view";
import { openQuickEditTooltipEffect, closeQuickEditEffect, quickEditField } from "./state";

/**
 * An update listener that watches for selection changes.
 * If the user selects a significant amount of text, we automatically
 * open the Quick Edit tooltip (instead of the full prompt).
 */
export const quickEditSelectionObserver = EditorView.updateListener.of((update) => {
  if (!update.selectionSet) return;

  const state = update.state;
  const mainSelection = state.selection.main;
  const quickEditState = state.field(quickEditField);

  // If we're already fully active (prompting, loading, preview), don't auto-close or auto-tooltips.
  const isSignificantSelection = mainSelection.to - mainSelection.from > 2;

  if (isSignificantSelection) {
    if (quickEditState.phase === "idle" || quickEditState.phase === "tooltip") {
      const selectionText = state.sliceDoc(mainSelection.from, mainSelection.to);
      
      queueMicrotask(() => {
        update.view.dispatch({
          effects: [openQuickEditTooltipEffect.of({
            from: mainSelection.from,
            to: mainSelection.to,
            selectionText,
          })]
        });
      });
    }
  } else {
    // If the selection is cleared (just a cursor), and we were showing the tooltip, close it.
    if (quickEditState.phase === "tooltip") {
      queueMicrotask(() => {
        update.view.dispatch({
          effects: [closeQuickEditEffect.of(undefined)]
        });
      });
    }
  }
});

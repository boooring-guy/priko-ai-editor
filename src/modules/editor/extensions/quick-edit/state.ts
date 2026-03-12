import { StateField, StateEffect } from "@codemirror/state";
import { type QuickEditState, initialQuickEditState } from "./types";

// ── State Effects (Actions) ─────────────────────────────────────────────

export const openQuickEditEffect = StateEffect.define<{
  from: number;
  to: number;
  selectionText: string;
  auto?: boolean;
}>();

export const closeQuickEditEffect = StateEffect.define<void>();

export const setLoadingQuickEditEffect = StateEffect.define<{
  prompt: string;
}>();

export const appendQuickEditCodeEffect = StateEffect.define<string>();

export const finalizeQuickEditCodeEffect = StateEffect.define<void>();

// User accepts or rejects the previewed code
export const acceptQuickEditEffect = StateEffect.define<void>();
export const rejectQuickEditEffect = StateEffect.define<void>();

// ── StateField (Reducer) ────────────────────────────────────────────────

export const quickEditField = StateField.define<QuickEditState>({
  create() {
    return initialQuickEditState;
  },

  update(value, tr) {
    let nextState = { ...value };

    // 1. Map positions if the document changes while the widget is active
    if (Object.keys(tr.changes).length > 0) {
      nextState.from = tr.changes.mapPos(nextState.from);
      // Map 'to' normally, or map to the right
      nextState.to = tr.changes.mapPos(nextState.to, 1);
    }

    // 2. Reduce effects
    for (const effect of tr.effects) {
      if (effect.is(openQuickEditEffect)) {
        nextState = {
          ...initialQuickEditState,
          phase: "prompting",
          from: effect.value.from,
          to: effect.value.to,
          selectionText: effect.value.selectionText,
          autoOpen: effect.value.auto,
        };
      } else if (effect.is(closeQuickEditEffect)) {
        nextState = { ...initialQuickEditState };
      } else if (effect.is(setLoadingQuickEditEffect)) {
        nextState.phase = "loading";
        nextState.prompt = effect.value.prompt;
        nextState.generatedCode = "";
      } else if (effect.is(appendQuickEditCodeEffect)) {
        nextState.generatedCode += effect.value;
      } else if (effect.is(finalizeQuickEditCodeEffect)) {
        nextState.phase = "preview";
      } else if (
        effect.is(acceptQuickEditEffect) ||
        effect.is(rejectQuickEditEffect)
      ) {
        nextState = { ...initialQuickEditState };
      }
    }

    return nextState;
  },
});

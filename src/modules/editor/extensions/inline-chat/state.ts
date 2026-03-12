/**
 * Inline Chat — State Management
 *
 * Defines the CodeMirror StateEffects and StateField that drive the
 * inline chat lifecycle: idle → prompting → loading → preview → idle.
 *
 * The StateField is the single source of truth for the inline chat UI.
 * Other modules (widgets, keybindings) dispatch effects to transition
 * between phases, and read the field to decide what to render.
 */

import { StateEffect, StateField } from "@codemirror/state";
import { type InlineChatState, IDLE_STATE } from "./types";

// ── Effects — messages dispatched to transition between phases ──────────

/** Open the prompt input at the current cursor position */
export const openPromptEffect = StateEffect.define<{
  anchorLine: number;
  from: number;
  to: number;
  originalCode: string;
}>();

/** Close / dismiss the inline chat entirely (returns to idle) */
export const closePromptEffect = StateEffect.define<void>();

/** Transition from prompting → loading (user submitted their prompt) */
export const setLoadingEffect = StateEffect.define<{ prompt: string }>();

/** Append streamed text to the generated code during loading */
export const appendGeneratedCodeEffect = StateEffect.define<string>();

/** Transition from loading → preview (streaming complete) */
export const finalizeGeneratedCodeEffect = StateEffect.define<void>();

/** Accept: insert the generated code into the document */
export const acceptCodeEffect = StateEffect.define<void>();

/** Reject: discard the generated code, return to idle */
export const rejectCodeEffect = StateEffect.define<void>();

// ── StateField — the single source of truth ─────────────────────────────

export const inlineChatField = StateField.define<InlineChatState>({
  create() {
    return IDLE_STATE;
  },

  update(state, tr) {
    for (const effect of tr.effects) {
      // Open prompt → "prompting" phase
      if (effect.is(openPromptEffect)) {
        return {
          ...IDLE_STATE,
          phase: "prompting" as const,
          anchorLine: effect.value.anchorLine,
          from: effect.value.from,
          to: effect.value.to,
          originalCode: effect.value.originalCode,
        };
      }

      // Close / dismiss → back to idle
      if (effect.is(closePromptEffect)) {
        return IDLE_STATE;
      }

      // User submitted prompt → "loading" phase
      if (effect.is(setLoadingEffect)) {
        return {
          ...state,
          phase: "loading" as const,
          prompt: effect.value.prompt,
        };
      }

      // Append streamed chunk to generated code (stays in "loading")
      if (effect.is(appendGeneratedCodeEffect)) {
        return {
          ...state,
          generatedCode: state.generatedCode + effect.value,
        };
      }

      // Streaming complete → "preview" phase
      if (effect.is(finalizeGeneratedCodeEffect)) {
        return {
          ...state,
          phase: "preview" as const,
        };
      }

      // Accept → idle (actual insertion is handled by the keybinding command)
      if (effect.is(acceptCodeEffect)) {
        return IDLE_STATE;
      }

      // Reject → idle
      if (effect.is(rejectCodeEffect)) {
        return IDLE_STATE;
      }
    }

    return state;
  },
});

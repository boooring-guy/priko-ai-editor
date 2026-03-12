/**
 * Inline Chat — Prompt Widget
 *
 * Renders an inline input bar below the anchor line when the user triggers
 * Cmd+K. The widget captures the user's natural-language prompt and
 * initiates the streaming AI request.
 *
 * IMPORTANT: CodeMirror requires block-level decorations to be provided
 * via a StateField (not a ViewPlugin). This module exports a StateField
 * that builds the prompt widget decoration, and a ViewPlugin that handles
 * the streaming fetch side-effects.
 */

import { StateField } from "@codemirror/state";
import {
  WidgetType,
  EditorView,
  Decoration,
  type DecorationSet,
} from "@codemirror/view";
import { fileNameFacet, contextProviderFacet } from "../suggestions";
import {
  inlineChatField,
  setLoadingEffect,
  appendGeneratedCodeEffect,
  finalizeGeneratedCodeEffect,
  closePromptEffect,
} from "./state";

// ── PromptWidget — the inline input DOM element ─────────────────────────

class PromptWidget extends WidgetType {
  constructor(private readonly phase: string) {
    super();
  }

  /**
   * We never want CodeMirror to reuse stale DOM for a different phase,
   * so widgets with different phases are considered different.
   */
  eq(other: PromptWidget) {
    return this.phase === other.phase;
  }

  toDOM(view: EditorView) {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-inline-chat-prompt";

    // ── Loading state: show spinner + prompt text ──
    if (this.phase === "loading") {
      wrapper.innerHTML = `
        <div class="cm-inline-chat-loading">
          <div class="cm-inline-chat-spinner"></div>
          <span>Generating…</span>
        </div>
      `;
      return wrapper;
    }

    // ── Prompting state: show input field ──
    const input = document.createElement("input");
    input.type = "text";
    input.className = "cm-inline-chat-input";
    input.placeholder =
      "Describe code to generate… (Enter to submit, Esc to cancel)";
    input.spellcheck = false;

    // Prevent CodeMirror from stealing focus / keystrokes
    input.addEventListener("keydown", (e) => {
      e.stopPropagation();

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const prompt = input.value.trim();
        if (!prompt) return;

        // Transition to loading phase and start the AI request
        submitPrompt(view, prompt);
      }

      if (e.key === "Escape") {
        e.preventDefault();
        view.dispatch({ effects: closePromptEffect.of(undefined) });
        view.focus();
      }
    });

    // Also prevent CM from handling mouse events on the input
    input.addEventListener("mousedown", (e) => e.stopPropagation());

    const hint = document.createElement("span");
    hint.className = "cm-inline-chat-hint";
    hint.textContent = "⌘K";

    wrapper.appendChild(hint);
    wrapper.appendChild(input);

    // Auto-focus the input after it's added to the DOM
    requestAnimationFrame(() => input.focus());

    return wrapper;
  }

  /**
   * Prevent CodeMirror from treating this widget as part of the text.
   * The widget handles its own events via the input element.
   */
  ignoreEvent() {
    return true;
  }
}

// ── Fetch helper (extracted so WidgetType can stay a pure class) ────────

/**
 * Submit the user's prompt to the inline-chat API endpoint.
 * The API returns `{ code: "..." }` as JSON. We dispatch the full
 * generated code at once and transition to the preview phase.
 */
async function submitPrompt(view: EditorView, prompt: string) {
  const state = view.state.field(inlineChatField);
  const fileName = view.state.facet(fileNameFacet);
  const code = view.state.doc.toString();
  
  const contextProvider = view.state.facet(contextProviderFacet);
  let contextFiles: import("../suggestions").ContextFile[] = [];
  if (contextProvider) {
    try {
      contextFiles = await contextProvider();
    } catch (e) {
      console.warn("Failed to fetch context files", e);
    }
  }

  // Grab selected text (if any) for replacement context
  const selection =
    state.from !== state.to ? view.state.sliceDoc(state.from, state.to) : null;

  // 1. Transition to loading phase
  view.dispatch({ effects: setLoadingEffect.of({ prompt }) });

  try {
    // 2. Call the API
    const response = await fetch("/api/inline-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        fileName,
        code,
        selection,
        cursorLine: state.anchorLine,
        contextFiles,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Inline chat API error:", response.status, errorText);
      throw new Error(`API returned ${response.status}`);
    }

    if (!response.body) {
      throw new Error("API response has no body");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    // 3. Read the stream progressively
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        view.dispatch({
          effects: appendGeneratedCodeEffect.of(chunk),
        });
      }
    }

    // 4. Transition to preview once stream is finished
    view.dispatch({
      effects: finalizeGeneratedCodeEffect.of(undefined),
    });
  } catch (error) {
    console.error("Inline chat fetch error:", error);
    // On error, close the prompt and return to idle
    view.dispatch({ effects: closePromptEffect.of(undefined) });
  }
}

// ── StateField for prompt widget decorations (block widgets require this) ──

/**
 * CodeMirror block-level decorations MUST be provided via a StateField,
 * not a ViewPlugin. This field builds the prompt widget decoration
 * whenever the inline chat state changes to "prompting" or "loading".
 */
export const promptWidgetField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(decos, tr) {
    const state = tr.state.field(inlineChatField);

    if (state.phase !== "prompting" && state.phase !== "loading") {
      return Decoration.none;
    }

    // Place the widget as a block decoration below the anchor line
    const lineNum = Math.min(state.anchorLine, tr.state.doc.lines);
    const line = tr.state.doc.line(lineNum);

    const deco = Decoration.widget({
      widget: new PromptWidget(state.phase),
      block: true,
      side: 1, // After the line
    });

    return Decoration.set([deco.range(line.to)]);
  },

  provide(field) {
    return EditorView.decorations.from(field);
  },
});

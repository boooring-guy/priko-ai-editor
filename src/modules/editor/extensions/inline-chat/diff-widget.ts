/**
 * Inline Chat — Diff Preview Widget
 *
 * Renders the AI-generated code as a highlighted preview block below the
 * anchor line, with Accept (✓) and Reject (✗) action buttons.
 *
 * The preview is shown during the "loading" phase (streaming, progressively
 * updated) and the "preview" phase (complete, ready for accept/reject).
 *
 * IMPORTANT: CodeMirror requires block-level decorations to be provided
 * via a StateField (not a ViewPlugin). This module exports a StateField
 * that builds the diff preview decoration.
 */

import { StateField, EditorState } from "@codemirror/state";
import {
  WidgetType,
  EditorView,
  Decoration,
  type DecorationSet,
} from "@codemirror/view";
import { language } from "@codemirror/language";
import { appCodeMirrorTheme } from "../../lib/codemirror-theme";
import { inlineChatField, acceptCodeEffect, rejectCodeEffect } from "./state";

// ── DiffPreviewWidget — shows generated code + accept/reject buttons ────

class DiffPreviewWidget extends WidgetType {
  constructor(
    private readonly code: string,
    private readonly phase: "loading" | "preview",
    private readonly from: number,
    private readonly to: number,
  ) {
    super();
  }

  eq(other: DiffPreviewWidget) {
    return this.code === other.code && this.phase === other.phase;
  }

  private nestedView: EditorView | null = null;

  toDOM(view: EditorView) {
    const container = document.createElement("div");
    container.className = "cm-inline-chat-diff";

    // ── Code preview area (Nested CodeMirror snippet) ──
    const codeContainer = document.createElement("div");
    codeContainer.className = "cm-inline-chat-diff-code-wrapper";
    
    // Attempt to extract the language facet from the parent view
    const parentLang = view.state.facet(language);
    // Usually the language facet returns a Language instance directly, or undefined if none.
    // If it's an array (based on some facet definitions), we'll grab the first item safely.
    let langExtension: any = [];
    if (Array.isArray(parentLang)) {
       langExtension = parentLang.length > 0 ? parentLang[0] : [];
    } else if (parentLang) {
       langExtension = parentLang;
    }

    this.nestedView = new EditorView({
      state: EditorState.create({
        doc: this.code || " ", // ensure it's not empty
        extensions: [
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
          appCodeMirrorTheme,
          langExtension,
          EditorView.theme({
            ".cm-content": { padding: "0" },
            ".cm-line": { padding: "0" }
          })
        ]
      }),
      parent: codeContainer
    });
    
    container.appendChild(codeContainer);

    // ── Action buttons (only shown when generation is complete) ──
    if (this.phase === "preview") {
      const actions = document.createElement("div");
      actions.className = "cm-inline-chat-diff-actions";

      const acceptBtn = document.createElement("button");
      acceptBtn.className = "cm-inline-chat-btn cm-inline-chat-btn-accept";
      acceptBtn.textContent = "Insert";
      acceptBtn.title = "Insert generated code (⌘↵)";
      acceptBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.acceptCode(view);
      });

      const rejectBtn = document.createElement("button");
      rejectBtn.className = "cm-inline-chat-btn cm-inline-chat-btn-reject";
      rejectBtn.textContent = "Cancel";
      rejectBtn.title = "Cancel code insertion (Esc)";
      rejectBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        view.dispatch({ effects: rejectCodeEffect.of(undefined) });
        view.focus();
      });

      actions.appendChild(acceptBtn);
      actions.appendChild(rejectBtn);
      container.appendChild(actions);
    } else {
      // During loading, show a subtle streaming indicator
      const streamingHint = document.createElement("div");
      streamingHint.className = "cm-inline-chat-streaming";
      streamingHint.textContent = "● Streaming…";
      container.appendChild(streamingHint);
    }

    return container;
  }

  /**
   * Accept the generated code — replaces the anchor range in the document
   * and dispatches the acceptCodeEffect to return to idle.
   */
  private acceptCode(view: EditorView) {
    const chatState = view.state.field(inlineChatField);
    const { from, to, generatedCode } = chatState;

    view.dispatch({
      changes: { from, to, insert: generatedCode },
      effects: acceptCodeEffect.of(undefined),
    });

    view.focus();
  }

  /**
   * Efficiently updates the nested view with new streamed code without recreating the DOM.
   */
  updateDOM(dom: HTMLElement, view: EditorView): boolean {
    if (!this.nestedView) return false;

    // Dispatch the new document state to the nested read-only editor
    const currentCode = this.nestedView.state.doc.toString();
    if (currentCode !== this.code) {
      this.nestedView.dispatch({
        changes: {
          from: 0,
          to: currentCode.length,
          insert: this.code || " "
        }
      });
    }

    // Returning false means CodeMirror WILL call toDOM again and rebuild the widget
    // from scratch if properties like `phase` change (e.g., from 'loading' to 'preview').
    // Since we want the buttons to appear using `toDOM` when generation finishes, 
    // returning false is actually safer here if the phase changes.
    // However, if only the `code` string changed and the phase is identical, 
    // we want to return true so CM doesn't rebuild the whole widget!
    // We can't access `oldWidget` here, so we rely on the `eq` method. If `eq` returned false
    // it was either because `code` changed OR `phase` changed.
    // If we handle the code change ourselves, we technically only need to rebuild if phase changed.
    // To be perfectly safe with CodeMirror's widget lifecycle and button injection:
    return false;
  }

  ignoreEvent() {
    return true;
  }

  destroy(dom: HTMLElement) {
    if (this.nestedView) {
      this.nestedView.destroy();
      this.nestedView = null;
    }
  }
}

// ── StateField for diff preview decorations (block widgets require this) ──

/**
 * CodeMirror block-level decorations MUST be provided via a StateField,
 * not a ViewPlugin. This field builds the diff preview decoration
 * whenever the inline chat state has generated code to show.
 */
export const diffWidgetField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(decos, tr) {
    const state = tr.state.field(inlineChatField);

    if (state.phase !== "loading" && state.phase !== "preview") {
      return Decoration.none;
    }

    // Don't show the diff widget until we have some generated code
    if (!state.generatedCode && state.phase === "loading") {
      return Decoration.none;
    }

    // Place the widget below the anchor line
    const lineNum = Math.min(state.anchorLine, tr.state.doc.lines);
    const line = tr.state.doc.line(lineNum);

    const deco = Decoration.widget({
      widget: new DiffPreviewWidget(
        state.generatedCode,
        state.phase as "loading" | "preview",
        state.from,
        state.to,
      ),
      block: true,
      side: 1,
    });

    return Decoration.set([deco.range(line.to)]);
  },

  provide(field) {
    return EditorView.decorations.from(field);
  },
});

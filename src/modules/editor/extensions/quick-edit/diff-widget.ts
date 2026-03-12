import { StateField, EditorState } from "@codemirror/state";
import {
  WidgetType,
  EditorView,
  Decoration,
  type DecorationSet,
} from "@codemirror/view";
import { language } from "@codemirror/language";
import { appCodeMirrorTheme } from "../../lib/codemirror-theme";
import { quickEditField, acceptQuickEditEffect, rejectQuickEditEffect } from "./state";

class QuickEditDiffPreviewWidget extends WidgetType {
  constructor(
    private readonly code: string,
    private readonly phase: "loading" | "preview",
    private readonly from: number,
    private readonly to: number,
  ) {
    super();
  }

  eq(other: QuickEditDiffPreviewWidget) {
    return this.code === other.code && this.phase === other.phase;
  }

  private nestedView: EditorView | null = null;

  toDOM(view: EditorView) {
    const container = document.createElement("div");
    container.className = "cm-inline-chat-diff";

    const codeContainer = document.createElement("div");
    codeContainer.className = "cm-inline-chat-diff-code-wrapper";

    const parentLang = view.state.facet(language);
    let langExtension: any = [];
    if (Array.isArray(parentLang)) {
       langExtension = parentLang.length > 0 ? parentLang[0] : [];
    } else if (parentLang) {
       langExtension = parentLang;
    }

    this.nestedView = new EditorView({
      state: EditorState.create({
        doc: this.code || " ", 
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

    if (this.phase === "preview") {
      const actions = document.createElement("div");
      actions.className = "cm-inline-chat-diff-actions";

      const acceptBtn = document.createElement("button");
      acceptBtn.textContent = "✓ Accept";
      acceptBtn.className = "cm-inline-chat-btn cm-inline-chat-btn-accept";
      
      acceptBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.acceptCode(view);
      });

      const rejectBtn = document.createElement("button");
      rejectBtn.textContent = "✗ Reject";
      rejectBtn.className = "cm-inline-chat-btn cm-inline-chat-btn-reject";

      rejectBtn.addEventListener("mousedown", (e) => {
        e.preventDefault();
        e.stopPropagation();
        view.dispatch({ effects: rejectQuickEditEffect.of(undefined) });
        view.focus();
      });

      actions.appendChild(rejectBtn);
      actions.appendChild(acceptBtn);
      container.appendChild(actions);
    } else {
      const streamingHint = document.createElement("div");
      streamingHint.className = "cm-inline-chat-streaming";
      streamingHint.textContent = "Generating…";
      container.appendChild(streamingHint);
    }

    return container;
  }

  private acceptCode(view: EditorView) {
    const state = view.state.field(quickEditField);
    const { from, to, generatedCode } = state;

    view.dispatch({
      changes: { from, to, insert: generatedCode },
      effects: acceptQuickEditEffect.of(undefined),
    });

    view.focus();
  }

  updateDOM(dom: HTMLElement, view: EditorView): boolean {
    if (!this.nestedView) return false;

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

export const quickEditDiffWidgetField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(decos, tr) {
    const state = tr.state.field(quickEditField);

    if (state.phase !== "loading" && state.phase !== "preview") {
      return Decoration.none;
    }

    if (!state.generatedCode && state.phase === "loading") {
      return Decoration.none;
    }

    const lineNum = tr.state.doc.lineAt(state.to).number;
    const line = tr.state.doc.line(lineNum);

    const deco = Decoration.widget({
      widget: new QuickEditDiffPreviewWidget(
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

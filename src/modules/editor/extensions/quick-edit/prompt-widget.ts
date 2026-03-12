import { StateField } from "@codemirror/state";
import {
  WidgetType,
  EditorView,
  Decoration,
  type DecorationSet,
} from "@codemirror/view";
import { fileNameFacet, contextProviderFacet } from "../../extensions/suggestions";
import {
  quickEditField,
  setLoadingQuickEditEffect,
  appendQuickEditCodeEffect,
  finalizeQuickEditCodeEffect,
  closeQuickEditEffect,
} from "./state";

class QuickEditPromptWidget extends WidgetType {
  constructor(private readonly phase: string) {
    super();
  }

  eq(other: QuickEditPromptWidget) {
    return this.phase === other.phase;
  }

  toDOM(view: EditorView) {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-inline-chat-prompt";

    if (this.phase === "loading") {
      wrapper.innerHTML = `
        <div class="cm-inline-chat-loading">
          <div class="cm-inline-chat-spinner"></div>
          <span>Applying Edit…</span>
        </div>
      `;
      return wrapper;
    }

    const input = document.createElement("input");
    input.type = "text";
    input.className = "cm-inline-chat-input";
    input.placeholder = "Edit Selected Code (Enter to submit, Esc to cancel)";
    input.spellcheck = false;

    input.addEventListener("keydown", (e) => {
      e.stopPropagation();

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const prompt = input.value.trim();
        if (!prompt) return;

        submitQuickEdit(view, prompt);
      }

      if (e.key === "Escape") {
        e.preventDefault();
        view.dispatch({ effects: closeQuickEditEffect.of(undefined) });
        view.focus();
      }
    });

    input.addEventListener("mousedown", (e) => e.stopPropagation());

    const hint = document.createElement("span");
    hint.className = "cm-inline-chat-hint";
    hint.textContent = "⇧⌘K";

    wrapper.appendChild(hint);
    wrapper.appendChild(input);

    requestAnimationFrame(() => input.focus());

    return wrapper;
  }

  ignoreEvent() {
    return true;
  }
}

async function submitQuickEdit(view: EditorView, prompt: string) {
  const state = view.state.field(quickEditField);
  const fileName = view.state.facet(fileNameFacet);
  const code = view.state.doc.toString();
  
  view.dispatch({ effects: setLoadingQuickEditEffect.of({ prompt }) });

  try {
    const doc = view.state.doc;
    const startLinePos = doc.lineAt(state.from);
    const endLinePos = doc.lineAt(state.to);
    
    const selectionStartLine = startLinePos.number;
    const selectionEndLine = endLinePos.number;
    
    const previousLines = doc.sliceString(Math.max(0, startLinePos.from - 500), startLinePos.from);
    const nextLines = doc.sliceString(endLinePos.to, Math.min(doc.length, endLinePos.to + 500));

    const response = await fetch("/api/quick-edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        selectionStartLine,
        selectionEndLine,
        selectedCode: state.selectionText,
        previousLines,
        nextLines,
        code,
        instruction: prompt,
      }),
    });

    if (!response.body) throw new Error("API response has no body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        view.dispatch({
          effects: appendQuickEditCodeEffect.of(chunk),
        });
      }
    }

    view.dispatch({
      effects: finalizeQuickEditCodeEffect.of(undefined),
    });
  } catch (error) {
    console.error("Quick edit fetch error:", error);
    view.dispatch({ effects: closeQuickEditEffect.of(undefined) });
  }
}

export const quickEditPromptWidgetField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },

  update(decos, tr) {
    const state = tr.state.field(quickEditField);

    if (state.phase !== "prompting" && state.phase !== "loading") {
      return Decoration.none;
    }

    // Place the widget below the selection
    const lineNum = tr.state.doc.lineAt(state.to).number;
    const line = tr.state.doc.line(lineNum);

    const deco = Decoration.widget({
      widget: new QuickEditPromptWidget(state.phase),
      block: true,
      side: 1, 
    });

    return Decoration.set([deco.range(line.to)]);
  },

  provide(field) {
    return EditorView.decorations.from(field);
  },
});

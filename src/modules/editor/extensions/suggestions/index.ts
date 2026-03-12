import { StateEffect, StateField, Prec, Facet } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
  keymap,
  ViewUpdate,
} from "@codemirror/view";
import { selectedCompletion, acceptCompletion } from "@codemirror/autocomplete";

// Facet to provide the filename to the extension
export const fileNameFacet = Facet.define<string, string>({
  combine: (values) => values[0] || "unknown.txt",
});

export interface ContextFile {
  fileName: string;
  content: string;
}

// Facet to provide the cross-file AI context callback to the extension
export const contextProviderFacet = Facet.define<
  (() => Promise<ContextFile[]>) | null,
  (() => Promise<ContextFile[]>) | null
>({
  combine: (values) => values[0] || null,
});

// StateEffect: A way to send "messages" to update state.
export const setSuggestionEffect = StateEffect.define<string | null>();

// StateField: Holds our suggestion state in the editor.
export const suggestionState = StateField.define<{
  text: string;
  pos: number;
} | null>({
  create() {
    return null;
  },
  update(value, tr) {
    for (const e of tr.effects) {
      if (e.is(setSuggestionEffect)) {
        if (e.value === null) return null;
        return { text: e.value, pos: tr.state.selection.main.head };
      }
    }
    // Clear suggestion when typing or moving cursor, unless we're explicitly setting it
    if (tr.docChanged || tr.selection) {
      return null;
    }
    return value;
  },
});

// WidgetType: Creates the DOM node for the ghost text.
class SuggestionWidget extends WidgetType {
  constructor(readonly text: string) {
    super();
  }

  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-inline-suggestion";
    span.textContent = this.text;
    return span;
  }
}

// ViewPlugin: Manages decorations and triggers AI fetches.
const suggestionPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    private timeout: any = null;

    constructor(view: EditorView) {
      this.decorations = this.getDecorations(view);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.selectionSet ||
        update.state.field(suggestionState) !==
          update.startState.field(suggestionState)
      ) {
        this.decorations = this.getDecorations(update.view);
      }

      if (update.docChanged) {
        this.debounceFetch(update.view);
      }
    }

    private debounceFetch(view: EditorView) {
      if (this.timeout) clearTimeout(this.timeout);

      // Don't fetch if there's an active completion menu
      if (selectedCompletion(view.state)) return;

      this.timeout = setTimeout(() => {
        this.fetchAiSuggestion(view);
      }, 1000); // 1s debounce
    }

    private async fetchAiSuggestion(view: EditorView) {
      const state = view.state;
      const selection = state.selection.main;
      if (!selection.empty) return;

      const pos = selection.head;
      const line = state.doc.lineAt(pos);
      const fileName = state.facet(fileNameFacet);

      const textBeforeCursor = state.sliceDoc(line.from, pos);
      const textAfterCursor = state.sliceDoc(pos, line.to);

      // Get some context (10 lines before and after)
      const prevLineNum = Math.max(1, line.number - 10);
      const nextLineNum = Math.min(state.doc.lines, line.number + 10);

      const previousLines = state.sliceDoc(
        state.doc.line(prevLineNum).from,
        line.from,
      );
      const nextLines = state.sliceDoc(line.to, state.doc.line(nextLineNum).to);

      const contextProvider = state.facet(contextProviderFacet);
      let contextFiles: ContextFile[] = [];
      if (contextProvider) {
        try {
          contextFiles = await contextProvider();
        } catch (e) {
          console.warn("Failed to fetch context files", e);
        }
      }

      try {
        const response = await fetch("/api/suggestion", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileName,
            code: state.doc.toString(),
            currentLine: line.text,
            previousLines,
            textBeforeCursor,
            textAfterCursor,
            nextLines,
            lineNumber: line.number,
            contextFiles,
          }),
        });

        if (!response.ok) return;

        const { suggestion } = await response.json();
        if (typeof suggestion === "string" && suggestion.length > 0) {
          view.dispatch({
            effects: setSuggestionEffect.of(suggestion),
          });
        }
      } catch (err) {
        console.error("Failed to fetch AI suggestion", err);
      }
    }

    getDecorations(view: EditorView) {
      const suggestion = view.state.field(suggestionState);
      let suggestionText = suggestion?.text || "";

      if (!suggestionText) {
        const activeCompletion = selectedCompletion(view.state);
        if (activeCompletion) {
          const cursor = view.state.selection.main.head;
          const word = view.state.wordAt(cursor);
          if (word && cursor <= word.to) {
            const typedText = view.state.sliceDoc(word.from, cursor);
            if (
              activeCompletion.label.startsWith(typedText) &&
              activeCompletion.label !== typedText
            ) {
              suggestionText = activeCompletion.label.slice(typedText.length);
            }
          }
        }
      }

      if (!suggestionText) return Decoration.none;

      const cursor = view.state.selection.main.head;

      // If we have a manual suggestion, verify the position matches
      if (suggestion && suggestion.pos !== cursor) {
        return Decoration.none;
      }

      const widget = Decoration.widget({
        widget: new SuggestionWidget(suggestionText),
        side: 1, // Display after the cursor
      });

      return Decoration.set([widget.range(cursor)]);
    }
  },
  {
    decorations: (v) => v.decorations,
  },
);

// Accept the active suggestion on an Editor action (Tab)
const acceptSuggestion = (view: EditorView) => {
  const suggestion = view.state.field(suggestionState);
  if (suggestion) {
    const cursor = view.state.selection.main.head;

    // Only accept if the cursor is at the position the suggestion was intended for
    if (suggestion.pos !== cursor) return false;

    view.dispatch({
      changes: { from: cursor, insert: suggestion.text },
      selection: { anchor: cursor + suggestion.text.length },
      effects: setSuggestionEffect.of(null),
    });
    return true;
  }

  const activeCompletion = selectedCompletion(view.state);
  if (activeCompletion) {
    return acceptCompletion(view);
  }

  return false;
};

// Key binding to accept suggestions on Tab
export const suggestionKeymap = Prec.highest(
  keymap.of([
    {
      key: "Tab",
      run: acceptSuggestion,
    },
  ]),
);

// Theme for the inline ghost text
export const suggestionTheme = EditorView.baseTheme({
  ".cm-inline-suggestion": {
    opacity: 0.5,
    fontStyle: "italic",
    pointerEvents: "none",
    whiteSpace: "pre-wrap",
  },
});

export const suggestion = (options: { 
  fileName: string;
  getContextFiles?: () => Promise<ContextFile[]>;
}) => {
  return [
    fileNameFacet.of(options.fileName),
    contextProviderFacet.of(options.getContextFiles || null),
    suggestionState,
    suggestionPlugin,
    suggestionKeymap,
    suggestionTheme,
  ];
};

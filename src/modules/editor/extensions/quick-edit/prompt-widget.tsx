import { StateField } from "@codemirror/state";
import {
  WidgetType,
  EditorView,
  Decoration,
  type DecorationSet,
} from "@codemirror/view";
import { fileNameFacet } from "../../extensions/suggestions";
import {
  quickEditField,
  openQuickEditEffect,
  setLoadingQuickEditEffect,
  appendQuickEditCodeEffect,
  finalizeQuickEditCodeEffect,
  closeQuickEditEffect,
} from "./state";
import { createRoot, type Root } from "react-dom/client";
import { CommandShortcut } from "@/components/ui/command";

// ── Shared shortcut badge (Discord-style <kbd>) ─────────────────────────

function ShortcutBadge({ keys }: { keys: string }) {
  return (
    <kbd className="flex h-5 items-center justify-center rounded border bg-muted/60 px-1 font-mono text-[10px] font-medium text-muted-foreground shadow-sm">
      <CommandShortcut className="ml-0 font-mono tracking-widest">
        {keys}
      </CommandShortcut>
    </kbd>
  );
}

// ── Base class for widgets that mount React roots ───────────────────────

abstract class ReactWidget extends WidgetType {
  protected root: Root | null = null;

  ignoreEvent() {
    return true;
  }

  destroy() {
    if (this.root) {
      const r = this.root;
      this.root = null;
      setTimeout(() => r.unmount(), 0);
    }
  }
}

// ── Prompt widget (prompting + loading phases) ──────────────────────────

class QuickEditPromptWidget extends ReactWidget {
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

    // Shortcut badge
    const badge = document.createElement("div");
    badge.className = "flex shrink-0 items-center justify-center mr-1";
    this.root = createRoot(badge);
    this.root.render(<ShortcutBadge keys="⇧⌘K" />);

    // Text input
    const input = document.createElement("input");
    input.type = "text";
    input.className = "cm-inline-chat-input";
    input.placeholder = "Edit Selected Code (Enter to submit, Esc to cancel)";
    input.spellcheck = false;
    input.addEventListener("mousedown", (e) => e.stopPropagation());
    input.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const text = input.value.trim();
        if (text) submitQuickEdit(view, text);
      } else if (e.key === "Escape") {
        e.preventDefault();
        view.dispatch({ effects: closeQuickEditEffect.of(undefined) });
        view.focus();
      }
    });

    wrapper.append(badge, input);
    requestAnimationFrame(() => input.focus());
    return wrapper;
  }
}

// ── Tooltip widget (tooltip phase — shown on selection) ─────────────────

class QuickEditTooltipWidget extends ReactWidget {
  eq() {
    return true;
  }

  toDOM(view: EditorView) {
    const wrapper = document.createElement("div");
    wrapper.className = "cm-inline-chat-prompt";
    Object.assign(wrapper.style, {
      cursor: "pointer",
      userSelect: "none",
      width: "fit-content",
      padding: "5px 8px",
    });

    this.root = createRoot(wrapper);
    this.root.render(
      <div className="flex items-center gap-2">
        <ShortcutBadge keys="⇧⌘K" />
        <span className="text-[13px] font-medium text-foreground tracking-tight">
          Quick Edit
        </span>
      </div>,
    );

    wrapper.addEventListener("mousedown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const s = view.state.field(quickEditField);
      view.dispatch({
        effects: [
          openQuickEditEffect.of({
            from: s.from,
            to: s.to,
            selectionText: s.selectionText,
            auto: true,
          }),
        ],
      });
    });

    return wrapper;
  }
}

// ── Network helper ──────────────────────────────────────────────────────

async function submitQuickEdit(view: EditorView, prompt: string) {
  const state = view.state.field(quickEditField);
  const fileName = view.state.facet(fileNameFacet);
  const doc = view.state.doc;

  view.dispatch({ effects: setLoadingQuickEditEffect.of({ prompt }) });

  try {
    const startLine = doc.lineAt(state.from);
    const endLine = doc.lineAt(state.to);

    const response = await fetch("/api/quick-edit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileName,
        selectionStartLine: startLine.number,
        selectionEndLine: endLine.number,
        selectedCode: state.selectionText,
        previousLines: doc.sliceString(
          Math.max(0, startLine.from - 500),
          startLine.from,
        ),
        nextLines: doc.sliceString(
          endLine.to,
          Math.min(doc.length, endLine.to + 500),
        ),
        code: doc.toString(),
        instruction: prompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Quick edit API error:", response.status, errorText);
      throw new Error(`API returned ${response.status}`);
    }

    if (!response.body) throw new Error("API response has no body");

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      if (chunk) {
        view.dispatch({ effects: appendQuickEditCodeEffect.of(chunk) });
      }
    }

    view.dispatch({ effects: finalizeQuickEditCodeEffect.of(undefined) });
  } catch (error) {
    console.error("Quick edit fetch error:", error);
    view.dispatch({ effects: closeQuickEditEffect.of(undefined) });
  }
}

// ── StateField — decoration provider ────────────────────────────────────

const ACTIVE_PHASES = new Set(["prompting", "loading", "tooltip"]);

export const quickEditPromptWidgetField = StateField.define<DecorationSet>({
  create: () => Decoration.none,

  update(_, tr) {
    const state = tr.state.field(quickEditField);
    if (!ACTIVE_PHASES.has(state.phase)) return Decoration.none;

    const line = tr.state.doc.lineAt(state.to);
    const widget =
      state.phase === "tooltip"
        ? new QuickEditTooltipWidget()
        : new QuickEditPromptWidget(state.phase);

    return Decoration.set([
      Decoration.widget({ widget, block: true, side: 1 }).range(line.to),
    ]);
  },

  provide: (field) => EditorView.decorations.from(field),
});

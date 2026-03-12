/**
 * Inline Chat — Barrel Export
 *
 * Composes all inline-chat extension pieces into a single `inlineChat()`
 * function that can be added to a CodeMirror EditorState's extensions array.
 *
 * Usage:
 *   import { inlineChat } from "../extensions/inline-chat";
 *
 *   const extensions = [
 *     // ... other extensions
 *     inlineChat({ fileName: "index.ts" }),
 *   ];
 *
 * The extension includes:
 *  - State field for lifecycle management
 *  - Prompt input widget (StateField — block decorations)
 *  - Diff preview widget (StateField — block decorations)
 *  - Keyboard shortcuts (Mod-K, Escape, Mod-Enter)
 *  - Theme styles for all DOM elements
 */

import type { Extension } from "@codemirror/state";
import { inlineChatField } from "./state";
import { promptWidgetField } from "./prompt-widget";
import { diffWidgetField } from "./diff-widget";
import { inlineChatKeymap } from "./keybindings";
import { inlineChatTheme, injectInlineChatAnimations } from "./theme";
import { contextProviderFacet, type ContextFile } from "../suggestions";

// ── Public API ──────────────────────────────────────────────────────────

export interface InlineChatOptions {
  /** The current file name (used for context in the AI prompt) */
  fileName: string;
  /** Callback to fetch currently active open tabs for cross-file context */
  getContextFiles?: () => Promise<ContextFile[]>;
}

/**
 * Creates the complete inline chat extension for CodeMirror.
 *
 * @param options - Configuration options for the inline chat
 * @returns An array of CodeMirror extensions
 */
export function inlineChat(options: InlineChatOptions): Extension {
  // Inject CSS animations into <head> (idempotent — only runs once)
  injectInlineChatAnimations();

  return [
    // 0. Facets — provide configuration down to the widgets
    contextProviderFacet.of(options.getContextFiles || null),

    // 1. State — the single source of truth for inline chat lifecycle
    inlineChatField,

    // 2. Widgets — render the prompt input and diff preview
    //    (Block decorations must come from StateFields, not ViewPlugins)
    promptWidgetField,
    diffWidgetField,

    // 3. Keybindings — Mod-K, Escape, Mod-Enter
    inlineChatKeymap,

    // 4. Theme — styles for all inline chat DOM elements
    inlineChatTheme,
  ];
}

// Re-export types and state for advanced usage
export { type InlineChatState, type InlineChatPhase } from "./types";
export {
  inlineChatField,
  openPromptEffect,
  closePromptEffect,
  acceptCodeEffect,
  rejectCodeEffect,
} from "./state";

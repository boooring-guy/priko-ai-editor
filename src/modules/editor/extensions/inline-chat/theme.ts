/**
 * Inline Chat — Theme & Styles
 *
 * EditorView.baseTheme() styles for all inline-chat DOM elements.
 * Uses the project's CSS custom properties (--primary, --background, etc.)
 * so the widgets blend seamlessly with the rest of the editor theme.
 *
 * Layout overview:
 * ┌─────────────────────────────────────────────┐
 * │  .cm-inline-chat-prompt                     │  ← Input bar (prompting phase)
 * │    ⌘K  [ Describe code to generate...     ] │
 * └─────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────┐
 * │  .cm-inline-chat-diff                       │  ← Preview block (loading/preview)
 * │  ┌─────────────────────────────────────────┐ │
 * │  │  .cm-inline-chat-diff-code              │ │
 * │  │  Generated code here...                 │ │
 * │  └─────────────────────────────────────────┘ │
 * │  [ ✓ Accept ] [ ✗ Reject ]                  │  ← Action buttons (preview phase)
 * └─────────────────────────────────────────────┘
 */

import { EditorView } from "@codemirror/view";

export const inlineChatTheme = EditorView.baseTheme({
  // ── Prompt input bar ──────────────────────────────────────────────────
  ".cm-inline-chat-prompt": {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 10px",
    margin: "4px 0",
    maxWidth: "500px",
    width: "100%",
    backgroundColor: "color-mix(in srgb, var(--popover, #1e1e2e) 95%, transparent)",
    backdropFilter: "blur(8px)",
    border: "1px solid color-mix(in srgb, var(--border, #313244) 60%, transparent)",
    borderRadius: "6px",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.4)",
  },

  ".cm-inline-chat-hint": {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2px 6px",
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--muted-foreground, #6c7086)",
    backgroundColor: "var(--muted, #313244)",
    borderRadius: "4px",
    fontFamily: "var(--font-mono, monospace)",
    flexShrink: "0",
  },

  ".cm-inline-chat-input": {
    flex: "1",
    padding: "4px 8px",
    fontSize: "13px",
    fontFamily: "var(--font-sans, system-ui)",
    color: "var(--foreground, #cdd6f4)",
    backgroundColor: "transparent",
    border: "none",
    outline: "none",
    caretColor: "var(--primary, #cba6f7)",
    "&::placeholder": {
      color: "var(--muted-foreground, #6c7086)",
      opacity: "0.7",
    },
  },

  // ── Loading spinner ───────────────────────────────────────────────────
  ".cm-inline-chat-loading": {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--muted-foreground, #6c7086)",
    fontSize: "13px",
    fontFamily: "var(--font-mono, monospace)",
  },

  ".cm-inline-chat-spinner": {
    width: "14px",
    height: "14px",
    border: "2px solid var(--border, #313244)",
    borderTopColor: "var(--primary, #cba6f7)",
    borderRadius: "50%",
    animation: "cm-inline-chat-spin 0.6s linear infinite",
  },

  // ── Diff preview block ────────────────────────────────────────────────
  ".cm-inline-chat-diff": {
    margin: "4px 0",
    maxWidth: "500px",
    width: "100%",
    border: "1px solid var(--border, #313244)",
    borderRadius: "8px",
    overflow: "hidden",
    backgroundColor: "var(--popover, #1e1e2e)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
  },

  ".cm-inline-chat-diff-code-wrapper": {
    margin: "0",
    backgroundColor: "var(--muted, #313244)",
    borderLeft: "3px solid color-mix(in srgb, var(--primary, #cba6f7) 50%, transparent)",
    maxHeight: "300px",
    overflow: "auto",
    "& .cm-editor": {
      backgroundColor: "transparent",
      fontSize: "13px",
      fontFamily: "var(--font-mono, monospace)",
    },
    "& .cm-scroller": {
      padding: "12px 16px",
      fontFamily: "var(--font-mono, monospace)",
    },
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      background: "color-mix(in srgb, var(--foreground) 15%, transparent)",
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      background: "color-mix(in srgb, var(--foreground) 25%, transparent)",
    },
  },

  // ── Streaming indicator ───────────────────────────────────────────────
  ".cm-inline-chat-streaming": {
    padding: "6px 16px",
    fontSize: "12px",
    color: "var(--primary, #cba6f7)",
    fontFamily: "var(--font-mono, monospace)",
    opacity: "0.8",
    animation: "cm-inline-chat-pulse 1.5s ease-in-out infinite",
  },

  // ── Action buttons row ────────────────────────────────────────────────
  ".cm-inline-chat-diff-actions": {
    display: "flex",
    gap: "6px",
    padding: "6px 10px",
    justifyContent: "flex-end", // Align buttons to right like Cursor
    borderTop: "1px solid color-mix(in srgb, var(--border, #313244) 50%, transparent)",
    backgroundColor: "var(--popover, #1e1e2e)",
  },

  ".cm-inline-chat-btn": {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "4px 10px",
    fontSize: "11px",
    fontWeight: "500",
    fontFamily: "var(--font-sans, system-ui)",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.1s ease",
    border: "1px solid transparent",
    outline: "none",
  },

  ".cm-inline-chat-btn-accept": {
    color: "var(--primary-foreground, #11111b)",
    backgroundColor: "var(--primary, #cba6f7)",
    "&:hover": {
      opacity: "0.9",
    },
  },

  ".cm-inline-chat-btn-reject": {
    color: "var(--muted-foreground, #a6adc8)",
    backgroundColor: "transparent",
    "&:hover": {
      backgroundColor: "color-mix(in srgb, var(--foreground) 8%, transparent)",
      color: "var(--foreground, #cdd6f4)",
    },
  },
});

/**
 * CSS @keyframes for the spinner and pulse animations.
 * Injected once into the document head since CM's baseTheme
 * doesn't support @keyframes directly.
 */
export function injectInlineChatAnimations() {
  if (typeof document === "undefined") return;
  if (document.getElementById("cm-inline-chat-animations")) return;

  const style = document.createElement("style");
  style.id = "cm-inline-chat-animations";
  style.textContent = `
    @keyframes cm-inline-chat-spin {
      to { transform: rotate(360deg); }
    }
    @keyframes cm-inline-chat-pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  `;
  document.head.appendChild(style);
}

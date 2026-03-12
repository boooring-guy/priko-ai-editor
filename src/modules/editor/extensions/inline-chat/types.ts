/**
 * Inline Chat — Type Definitions
 *
 * Shared interfaces and enums used across all inline-chat extension modules.
 * Keeping types in a single file prevents circular imports and provides
 * a single source of truth for the feature's data shapes.
 */

// ── Lifecycle phases of the inline chat widget ──────────────────────────
export type InlineChatPhase =
  | "idle" // No inline chat is active
  | "prompting" // The prompt input widget is visible, user is typing
  | "loading" // AI request is in-flight, showing spinner
  | "preview"; // Generated code is shown as a diff preview

// ── The full state held by the CodeMirror StateField ────────────────────
export interface InlineChatState {
  /** Current lifecycle phase */
  phase: InlineChatPhase;

  /** The line number where Cmd+K was triggered (1-indexed) */
  anchorLine: number;

  /** The document position (from, to) of the anchor line or selection */
  from: number;
  to: number;

  /** The user's natural-language prompt (set after submission) */
  prompt: string;

  /** The AI-generated code to preview */
  generatedCode: string;

  /** The original code that was at the anchor position (for reject/undo) */
  originalCode: string;
}

// ── The "empty" / idle state singleton ──────────────────────────────────
export const IDLE_STATE: InlineChatState = {
  phase: "idle",
  anchorLine: 0,
  from: 0,
  to: 0,
  prompt: "",
  generatedCode: "",
  originalCode: "",
};

import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

const editorTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      height: "100%",
    },
    "&.cm-focused": {
      outline: "none",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono, monospace)",
      lineHeight: "1.5",
    },
    ".cm-content": {
      caretColor: "var(--primary)",
      fontFamily: "var(--font-mono, monospace)",
      fontSize: "0.875rem",
      padding: "0.75rem 0",
    },
    ".cm-line": {
      padding: "0 0.75rem",
    },
    ".cm-cursor, .cm-dropCursor": {
      borderLeftColor: "var(--primary)",
      borderLeftWidth: "2px",
    },
    "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      {
        backgroundColor: "color-mix(in srgb, var(--primary) 25%, transparent)",
      },
    ".cm-selectionMatch": {
      backgroundColor: "color-mix(in srgb, var(--muted) 85%, transparent)",
    },
    ".cm-searchMatch": {
      backgroundColor: "color-mix(in srgb, var(--accent) 65%, transparent)",
      outline: "1px solid var(--ring)",
    },
    ".cm-searchMatch.cm-searchMatch-selected": {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
    },
    ".cm-activeLine": {
      backgroundColor: "color-mix(in srgb, var(--muted) 70%, transparent)",
    },
    ".cm-gutters": {
      backgroundColor: "var(--background)",
      color: "var(--muted-foreground)",
      borderRight: "1px solid var(--border)",
    },
    ".cm-gutterElement": {
      padding: "0 0.5rem 0 0.75rem",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "transparent",
      color: "var(--foreground)",
      fontWeight: "600",
    },
    ".cm-panels": {
      backgroundColor: "var(--card)",
      color: "var(--card-foreground)",
    },
    ".cm-panels.cm-panels-top": {
      borderBottom: "1px solid var(--border)",
    },
    ".cm-panels.cm-panels-bottom": {
      borderTop: "1px solid var(--border)",
    },
    ".cm-tooltip": {
      backgroundColor: "var(--popover)",
      border: "1px solid var(--border)",
      borderRadius: "calc(var(--radius) - 4px)",
      color: "var(--popover-foreground)",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "var(--accent)",
      color: "var(--accent-foreground)",
    },
    ".cm-matchingBracket": {
      backgroundColor: "color-mix(in srgb, var(--secondary) 80%, transparent)",
      color: "var(--foreground)",
      outline: "1px solid var(--ring)",
    },
    ".cm-nonmatchingBracket": {
      backgroundColor:
        "color-mix(in srgb, var(--destructive) 18%, transparent)",
      color: "var(--destructive)",
    },
  },
  { dark: true },
);

const syntaxTheme = HighlightStyle.define([
  { tag: t.keyword, color: "var(--primary)", fontWeight: "700" },
  {
    tag: [t.name, t.deleted, t.character, t.macroName],
    color: "var(--chart-1)",
  },
  { tag: [t.propertyName, t.attributeName], color: "var(--chart-2)" },
  { tag: [t.variableName, t.standard(t.name)], color: "var(--foreground)" },
  {
    tag: [t.processingInstruction, t.string, t.inserted, t.special(t.string)],
    color: "var(--chart-3)",
  },
  { tag: [t.function(t.variableName), t.labelName], color: "var(--chart-4)" },
  { tag: [t.color, t.constant(t.name)], color: "var(--chart-5)" },
  {
    tag: [t.className, t.typeName],
    color: "var(--chart-5)",
    fontStyle: "italic",
  },
  {
    tag: [t.number, t.changed, t.annotation, t.modifier, t.self, t.namespace],
    color: "var(--chart-3)",
  },
  { tag: [t.atom, t.bool, t.special(t.variableName)], color: "var(--chart-5)" },
  { tag: [t.operator, t.operatorKeyword], color: "var(--primary)" },
  {
    tag: [t.comment, t.meta],
    color: "var(--muted-foreground)",
    fontStyle: "italic",
  },
  { tag: t.strong, fontWeight: "700" },
  { tag: t.emphasis, fontStyle: "italic" },
  { tag: t.link, textDecoration: "underline", color: "var(--chart-2)" },
  { tag: t.heading, fontWeight: "700", color: "var(--primary)" },
  { tag: t.invalid, color: "var(--destructive)" },
]);

export const appCodeMirrorTheme = [
  editorTheme,
  syntaxHighlighting(syntaxTheme, { fallback: true }),
];

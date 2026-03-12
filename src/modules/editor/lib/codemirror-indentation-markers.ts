import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import type { Extension } from "@codemirror/state";

interface IndentationConfig {
  enabled: boolean;
  highlightActiveBlock: boolean;
  hideFirstIndent: boolean;
  markerType: string;
  thickness: number;
}

export function indentationMarkersExtension(
  opts: IndentationConfig,
): Extension[] {
  if (!opts.enabled) return [];

  return [
    indentationMarkers({
      highlightActiveBlock: opts.highlightActiveBlock,
      hideFirstIndent: opts.hideFirstIndent,
      markerType: opts.markerType as "fullScope" | "codeOnly",
      thickness: opts.thickness,
    }),
  ];
}

import { indentationMarkers } from "@replit/codemirror-indentation-markers";
import type { Extension } from "@codemirror/state";
import config from "@/config.json";

const opts = config.app.editor.indentationMarkers;

export function indentationMarkersExtension(): Extension[] {
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

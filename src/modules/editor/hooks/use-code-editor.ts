import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from "@codemirror/autocomplete";
import {
  copyLineDown,
  copyLineUp,
  cursorLineBoundaryBackward,
  cursorLineBoundaryForward,
  defaultKeymap,
  history,
  historyKeymap,
  indentLess,
  indentMore,
  indentWithTab,
  moveLineDown,
  moveLineUp,
  selectLineBoundaryBackward,
  selectLineBoundaryForward,
  toggleComment,
} from "@codemirror/commands";
import { suggestion } from "../extensions/suggestions";
import { inlineChat } from "../extensions/inline-chat";
import { cpp } from "@codemirror/lang-cpp";
import { css } from "@codemirror/lang-css";
import { go } from "@codemirror/lang-go";
import { html } from "@codemirror/lang-html";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import { markdown } from "@codemirror/lang-markdown";
import { python } from "@codemirror/lang-python";
import { rust } from "@codemirror/lang-rust";
import { sql } from "@codemirror/lang-sql";
import { angular } from "@codemirror/lang-angular";
import { java } from "@codemirror/lang-java";
import { less } from "@codemirror/lang-less";
import { php } from "@codemirror/lang-php";
import { sass } from "@codemirror/lang-sass";
import { vue } from "@codemirror/lang-vue";
import { xml } from "@codemirror/lang-xml";
import { yaml } from "@codemirror/lang-yaml";
import { lua } from "@codemirror/legacy-modes/mode/lua";
import {
  bracketMatching,
  foldGutter,
  foldKeymap,
  indentOnInput,
  indentUnit,
  StreamLanguage,
} from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap } from "@codemirror/search";
import { lintKeymap } from "@codemirror/lint";
import { EditorState, type Extension } from "@codemirror/state";
import {
  crosshairCursor,
  drawSelection,
  dropCursor,
  EditorView,
  highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  placeholder,
  rectangularSelection,
  scrollPastEnd,
} from "@codemirror/view";
import { useSetAtom, useAtomValue } from "jotai";
import { useCallback, useEffect, useRef, useState } from "react";
import { userConfigAtom } from "@/modules/config/store/config-atoms";
import { appCodeMirrorTheme } from "../lib/codemirror-theme";
import { minimapExtension } from "../lib/codemirror-minimap";
import { indentationMarkersExtension } from "../lib/codemirror-indentation-markers";
import { setFileDraftAtom } from "../store/editor-atoms";

// ── Fold-gutter icons (Lucide chevrons) ─────────────────────────────────
const foldGutterClosedSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>`;
const foldGutterOpenSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

function customFoldGutter() {
  return foldGutter({
    markerDOM(open) {
      const icon = document.createElement("div");
      icon.style.display = "flex";
      icon.style.alignItems = "center";
      icon.style.justifyContent = "center";
      icon.style.width = "16px";
      icon.style.height = "16px";
      icon.style.cursor = "pointer";
      icon.style.opacity = "0.5";
      icon.innerHTML = open ? foldGutterOpenSvg : foldGutterClosedSvg;
      return icon;
    },
  });
}

// Language extension mapper
export function getLanguageExtension(fileName: string): Extension[] {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "js":
    case "jsx":
      return [javascript({ jsx: true })];
    case "ts":
    case "tsx":
      return [javascript({ jsx: true, typescript: true })];
    case "html":
      return [html()];
    case "css":
      return [css()];
    case "json":
      return [json()];
    case "md":
    case "markdown":
      return [markdown()];
    case "py":
      return [python()];
    case "rs":
      return [rust()];
    case "cpp":
    case "c":
    case "h":
    case "hpp":
      return [cpp()];
    case "sql":
      return [sql()];
    case "go":
      return [go()];
    case "java":
      return [java()];
    case "php":
      return [php()];
    case "vue":
      return [vue()];
    case "angular":
      return [angular()];
    case "xml":
      return [xml()];
    case "yml":
    case "yaml":
      return [yaml()];
    case "scss":
    case "sass":
      return [sass()];
    case "less":
      return [less()];
    case "lua":
      return [StreamLanguage.define(lua)];
    default:
      return [];
  }
}

interface UseCodeEditorProps {
  fileId: string;
  initialContent: string;
  draftContent: string | null;
  onSave?: (content: string) => void;
  fileName: string; // Used to determine language
  getContextFiles?: () => Promise<import("../extensions/suggestions").ContextFile[]>;
}

export function useCodeEditor({
  fileId,
  initialContent,
  draftContent,
  onSave,
  fileName,
  getContextFiles,
}: UseCodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const setDraft = useSetAtom(setFileDraftAtom);
  const config = useAtomValue(userConfigAtom);
  const [content, setContent] = useState(draftContent ?? initialContent);

  // Simple save shortcut
  const handleSave = useCallback(
    (view: EditorView) => {
      const currentContent = view.state.doc.toString();
      if (onSave) onSave(currentContent);
      // Clear the draft, which also marks dirty=false
      setDraft(fileId, null);
      return true; // prevent default browser save
    },
    [fileId, onSave, setDraft],
  );

  // Initialize CodeMirror instance
  // biome-ignore lint/correctness/useExhaustiveDependencies: recreate the editor only when the file changes
  useEffect(() => {
    if (!containerRef.current) return;

    const extensions: Extension[] = [
      EditorState.allowMultipleSelections.of(true),
      EditorState.tabSize.of(2),
      indentUnit.of("  "),
      lineNumbers(),
      highlightActiveLineGutter(),
      customFoldGutter(),
      highlightActiveLine(),
      highlightSpecialChars(),
      drawSelection(),
      dropCursor(),
      rectangularSelection(),
      crosshairCursor(),
      history(),
      indentOnInput(),
      bracketMatching(),
      closeBrackets(),
      autocompletion(),
      highlightSelectionMatches(),
      scrollPastEnd(),
      EditorView.lineWrapping,

      placeholder("Start typing…"),
      ...(config.app.editor.minimap.enabled ? [minimapExtension] : []),
      ...indentationMarkersExtension(config.app.editor.indentationMarkers),
      ...appCodeMirrorTheme,
      ...getLanguageExtension(fileName),
      keymap.of([
        indentWithTab,
        // Duplicate line (VS Code: Shift+Alt+Down / Shift+Alt+Up)
        { key: "Shift-Alt-ArrowDown", run: copyLineDown },
        { key: "Shift-Alt-ArrowUp", run: copyLineUp },
        // Move line up/down (VS Code: Alt+Up / Alt+Down)
        { key: "Alt-ArrowUp", run: moveLineUp },
        { key: "Alt-ArrowDown", run: moveLineDown },
        // Toggle line comment (VS Code: Cmd+/ or Ctrl+/)
        { key: "Mod-/", run: toggleComment },
        // Indent / Outdent (explicit, in addition to indentWithTab)
        { key: "Mod-]", run: indentMore },
        { key: "Mod-[", run: indentLess },
        // Smart home/end – jump to line boundary
        {
          key: "Home",
          run: cursorLineBoundaryBackward,
          shift: selectLineBoundaryBackward,
        },
        {
          key: "End",
          run: cursorLineBoundaryForward,
          shift: selectLineBoundaryForward,
        },
        ...closeBracketsKeymap,
        ...defaultKeymap,
        ...searchKeymap,
        ...historyKeymap,
        ...foldKeymap,
        ...completionKeymap,
        ...lintKeymap,
        {
          key: "Mod-s",
          run: handleSave,
        },
      ]),
      EditorView.updateListener.of((update) => {
        if (update.docChanged) {
          const newDoc = update.state.doc.toString();
          setContent(newDoc);
          if (newDoc !== initialContent) {
            setDraft(fileId, newDoc);
          } else {
            setDraft(fileId, null); // completely reverted to DB state
          }
        }
      }),

      // Custom extensions
      suggestion({ fileName, getContextFiles }),
      inlineChat({ fileName, getContextFiles }),
    ];

    const state = EditorState.create({
      doc: draftContent ?? initialContent,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [fileId]); // Recreate view when file changes completely

  // If initial content changes (e.g., refetching from server happens, or we revert), update document
  // but ONLY if the editor is completely clean and matches what we had, to prevent overwriting local edits.
  // biome-ignore lint/correctness/useExhaustiveDependencies: sync only on external source changes
  useEffect(() => {
    if (viewRef.current) {
      const currentDoc = viewRef.current.state.doc.toString();
      if (currentDoc === initialContent) return; // already in sync

      // We only forcefully replace the content if it's an external update
      // Check if it's dirty? Usually we don't want to blow away dirty content
      // Let's keep it simple: if initialContent changes, we dispatch. We trust React Query caching logic.
      // But we shouldn't overwrite if the user has a draft!
      if (draftContent !== null) return;

      viewRef.current.dispatch({
        changes: {
          from: 0,
          to: viewRef.current.state.doc.length,
          insert: initialContent,
        },
      });
      // reset dirty since it maps to the new external source of truth
      setDraft(fileId, null);
    }
  }, [initialContent]);

  return { containerRef, content };
}

"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { useGetFileContent, useUpdateFile } from "@/modules/files/hooks";
import { useCodeEditor } from "../hooks/use-code-editor";
import { editorDraftsAtom } from "../store/editor-atoms";
import { useAtomValue } from "jotai";
import { toast } from "sonner";
import type { FileSelect } from "@/db/schema";
import { useAutosave } from "../hooks/use-autosave";

interface CodeEditorProps {
  fileId: string;
  projectId: string;
}

export function CodeEditor({ fileId, projectId }: CodeEditorProps) {
  // 1. Fetch live content from DB
  const {
    data: fileNode,
    isPending,
    isError,
  } = useGetFileContent(fileId, projectId);

  if (isPending) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background text-muted-foreground gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading editor...</p>
      </div>
    );
  }

  if (isError || !fileNode) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background/50">
        <p className="text-sm text-destructive">Failed to load file</p>
      </div>
    );
  }

  return (
    <CodeEditorInner
      fileId={fileId}
      projectId={projectId}
      fileNode={fileNode}
    />
  );
}

interface CodeEditorInnerProps {
  fileId: string;
  projectId: string;
  fileNode: FileSelect;
}

function CodeEditorInner({
  fileId,
  projectId,
  fileNode,
}: CodeEditorInnerProps) {
  const { mutateAsync: saveFile } = useUpdateFile();
  const [isSaving, setIsSaving] = useState(false);

  // Autosave all dirty files on interval / focus-loss
  useAutosave({ projectId });
  const drafts = useAtomValue(editorDraftsAtom);
  const draftContent = drafts[fileId] ?? null;

  // 2. Wrap the imperative CM view
  const { containerRef, content: _ } = useCodeEditor({
    fileId,
    initialContent: fileNode.content || "",
    draftContent,
    fileName: fileNode.name || "unknown.txt",
    getContextFiles: async () => {
      // Lazy load to break circular dependencies or avoid hook ordering issues
      const { getDefaultStore } = await import("jotai");
      const { openTabsAtom, flatFilesAtom } = await import("@/modules/files/store/file-atoms");
      const { queryClient } = await import("@/components/providers");
      const { queryKeys } = await import("@/lib/query-keys");
      
      const store = getDefaultStore();
      const openTabs = store.get(openTabsAtom) || [];
      const flatFiles = store.get(flatFilesAtom) || [];
      const allDrafts = store.get(editorDraftsAtom) || {};

      // Filter out current file and non-existent files. Grab last 3.
      const contextTabs = openTabs
        .filter(t => t.fileId !== fileId)
        .slice(0, 3);
        
      const results: import("../extensions/suggestions").ContextFile[] = [];
      
      for (const tab of contextTabs) {
        const fileMeta = flatFiles.find(f => f.id === tab.fileId);
        if (!fileMeta) continue;

        let content = allDrafts[tab.fileId];
        if (!content) {
          // Fallback to React Query cache
          const cachedNode = queryClient.getQueryData<any>(queryKeys.files.detail(tab.fileId));
          if (cachedNode && cachedNode.content) {
            content = cachedNode.content;
          }
        }
        
        if (content) {
          results.push({
            fileName: fileMeta.name,
            content
          });
        }
      }
      
      return results;
    },
    onSave: async (newContent) => {
      try {
        setIsSaving(true);
        await saveFile({
          id: fileId,
          projectId,
          content: newContent,
        });
        // toast.success("Saved");
      } catch (err) {
        toast.error("Failed to save changes");
        console.error(err);
      } finally {
        setIsSaving(false);
      }
    },
  });

  return (
    <div className="relative h-full w-full bg-background overflow-hidden flex flex-col">
      {isSaving && (
        <div className="absolute top-2 right-4 z-50 text-xs text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Saving...
        </div>
      )}
      <div
        ref={containerRef}
        className="flex-1 w-full h-full text-left"
        style={{
          // Fix for CodeMirror scroll container in flex layouts
          minHeight: 0,
        }}
      />
    </div>
  );
}

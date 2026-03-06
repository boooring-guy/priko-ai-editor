"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { activeTabIdAtom } from "@/modules/files/store/file-atoms";
import { activeProjectAtom } from "@/modules/projects/store/project-atoms";
import { CodeEditor } from "@/modules/editor/components/code-editor";

export function CodeView() {
  const activeTabId = useAtomValue(activeTabIdAtom);
  const activeProject = useAtomValue(activeProjectAtom);

  if (!activeTabId || !activeProject) {
    return null;
  }

  return (
    <div className="h-full w-full bg-background">
      <CodeEditor fileId={activeTabId} projectId={activeProject.id} />
    </div>
  );
}

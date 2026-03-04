"use client";

import React from "react";
import { Code2 } from "lucide-react";
import { useAtomValue } from "jotai";
import {
  activeTabIdAtom,
  flatFilesAtom,
  openTabsAtom,
} from "@/modules/files/store/file-atoms";

export function CodeView() {
  const activeTabId = useAtomValue(activeTabIdAtom);
  const flatFiles = useAtomValue(flatFilesAtom);
  const openTabs = useAtomValue(openTabsAtom);

  // Resolve active file metadata
  const activeFile = activeTabId
    ? flatFiles.find((f) => f.id === activeTabId)
    : null;

  // Is this tab temporary (preview) or pinned?
  const activeTab = activeTabId
    ? openTabs.find((t) => t.fileId === activeTabId)
    : null;

  if (!activeFile) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center bg-background/50 text-center backdrop-blur-sm">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
          <Code2 className="h-6 w-6 text-foreground/70" />
        </div>
        <p className="text-base font-medium text-foreground">Code View</p>
        <p className="mt-2 max-w-[250px] text-sm text-muted-foreground">
          The interactive PriKo Editor code space will be displayed right here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background/50 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
        <Code2 className="h-6 w-6 text-foreground/70" />
      </div>
      <p
        className={`text-base font-medium text-foreground ${!activeTab?.isPinned ? "italic" : ""}`}
      >
        {activeFile.name}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {activeTab?.isPinned ? "Pinned" : "Preview"} · {openTabs.length} tab
        {openTabs.length !== 1 ? "s" : ""} open
      </p>
    </div>
  );
}

"use client";

import React, { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { useAtomValue } from "jotai";
import { cn } from "@/lib/utils";
import {
  activeTabIdAtom,
  flatFilesAtom,
} from "@/modules/files/store/file-atoms";
import { makeFileIcon, makeFolderIcon } from "@/lib/file-icon";
import { userConfigAtom } from "@/modules/config/store/config-atoms";

interface FileBreadcrumbProps {
  className?: string;
}

export function FileBreadcrumb({ className }: FileBreadcrumbProps) {
  const activeTabId = useAtomValue(activeTabIdAtom);
  const flatFiles = useAtomValue(flatFilesAtom);

  // Build a lookup map for O(1) parent resolution
  const fileMap = useMemo(() => {
    const map = new Map<string, (typeof flatFiles)[number]>();
    for (const f of flatFiles) map.set(f.id, f);
    return map;
  }, [flatFiles]);

  // Walk the parentId chain to produce the full path from root → active file
  const segments = useMemo(() => {
    if (!activeTabId) return [];
    const chain: (typeof flatFiles)[number][] = [];
    let current = fileMap.get(activeTabId);
    while (current) {
      chain.unshift(current);
      current = current.parentId ? fileMap.get(current.parentId) : undefined;
    }
    return chain;
  }, [activeTabId, fileMap]);

  const config = useAtomValue(userConfigAtom);

  // Respect the feature flag — after all hooks so React rules are satisfied
  if (!config.app.editor.fileBreadcrumb.enabled) return null;

  // Nothing open — hide the bar entirely
  if (segments.length === 0) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-0.5 px-3 h-7 border-b bg-background/80 shrink-0 min-w-0 overflow-x-auto",
        "[@supports(backdrop-filter:blur(0))]:backdrop-blur-sm",
        "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className,
      )}
    >
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const isDir = seg.fileType === "directory";
        // Directories get the folder icon, the leaf file gets the file icon
        const SegIcon = isDir
          ? makeFolderIcon(seg.name)
          : makeFileIcon(seg.name);

        return (
          <React.Fragment key={seg.id}>
            <span
              className={cn(
                "flex items-center gap-1 text-[11px] whitespace-nowrap shrink-0 select-none",
                isLast
                  ? "text-foreground/80 font-medium"
                  : "text-muted-foreground/60",
              )}
            >
              <SegIcon className="h-3 w-3 shrink-0 opacity-70" />
              {seg.name}
            </span>

            {!isLast && (
              <ChevronRight
                className="h-3 w-3 shrink-0 text-muted-foreground/30"
                strokeWidth={1.5}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

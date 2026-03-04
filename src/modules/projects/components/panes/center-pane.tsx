"use client";

import React, { useRef, useState, useMemo } from "react";
import { Code2, Eye, Github, X } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAtomValue, useSetAtom } from "jotai";
import { cn } from "@/lib/utils";
import { makeFileIcon } from "@/lib/file-icon";
import {
  openTabsAtom,
  activeTabIdAtom,
  flatFilesAtom,
  closeTabAtom,
  pinFileAtom,
  openFileTemporarilyAtom,
} from "@/modules/files/store/file-atoms";
import { activeProjectAtom } from "@/modules/projects/store/project-atoms";
import { ExplorerContextMenu } from "./explorer/explorer-context-menu";
import type { FileNode } from "@/modules/files/shared/file-type-guards";

import { CodeView } from "./code-view";
import { PreviewView } from "./preview-view";
import { FileBreadcrumb } from "./file-breadcrumb";
import { useGlobalTabShortcuts } from "@/hooks/use-global-tab-shortcuts";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const modeTabs = [
  { id: "code", label: "Code", icon: Code2 },
  { id: "preview", label: "Preview", icon: Eye },
];

export function CenterPane() {
  const [activeMode, setActiveMode] = useState("code");
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  // ── Editor tab state ───────────────────────────────────────────────────────
  const openTabs = useAtomValue(openTabsAtom);
  const activeTabId = useAtomValue(activeTabIdAtom);
  const flatFiles = useAtomValue(flatFilesAtom);
  const closeTab = useSetAtom(closeTabAtom);
  const pinFile = useSetAtom(pinFileAtom);
  const openTemporarily = useSetAtom(openFileTemporarilyAtom);
  const activeProject = useAtomValue(activeProjectAtom);

  // ── Global Keyboard Shortcuts ──────────────────────────────────────────────
  useGlobalTabShortcuts();

  // Build lookup: file ID → full flat file entry (for context menu)
  const fileMap = useMemo(() => {
    const map = new Map<string, (typeof flatFiles)[number]>();
    for (const f of flatFiles) map.set(f.id, f);
    return map;
  }, [flatFiles]);

  const handleExport = () => {
    toast.success("Exporting to GitHub...");
  };

  useGSAP(() => {
    // Animate sliding bottom-border indicator
    const activeIndex = modeTabs.findIndex((t) => t.id === activeMode);
    const activeEl = tabRefs.current[activeIndex];

    if (activeEl && indicatorRef.current) {
      gsap.to(indicatorRef.current, {
        x: activeEl.offsetLeft,
        width: activeEl.offsetWidth,
        duration: 0.45,
        ease: "power4.out",
      });
    }

    // Animate content entrance
    if (contentWrapperRef.current) {
      gsap.fromTo(
        contentWrapperRef.current,
        { opacity: 0, scale: 0.98, y: 8 },
        { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power3.out" },
      );
    }
  }, [activeMode]);

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
      {/* ── Single header: file tabs + mode toggle + export ──── */}
      <TooltipProvider delayDuration={800}>
        <div className="relative h-10 border-b flex items-stretch shrink-0 bg-background z-10 min-w-0 overflow-hidden">
          {/* File tabs — scrollable left section */}
          {openTabs.length > 0 && (
            <div
              className="flex items-stretch overflow-x-auto [&::-webkit-scrollbar]:h-[2px] [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 active:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/40 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent transition-all"
              onWheel={(e) => {
                // Translate vertical mouse wheel scrolling to horizontal
                if (e.deltaY !== 0) {
                  e.currentTarget.scrollLeft += e.deltaY;
                }
              }}
            >
              {openTabs.map((tab) => {
                const file = fileMap.get(tab.fileId);
                if (!file) return null;

                const isActive = activeTabId === tab.fileId;
                const FileIcon = makeFileIcon(file.name);

                const fileNode = {
                  ...file,
                  children: [],
                } as unknown as FileNode;

                const tabContent = (
                  <div
                    key={tab.fileId}
                    className={cn(
                      "group relative flex items-center gap-1.5 pl-3 pr-1 h-full border-r cursor-pointer select-none transition-colors duration-150 min-w-0 max-w-[180px]",
                      isActive
                        ? "bg-muted/30 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/10",
                    )}
                    onClick={() => openTemporarily(tab.fileId)}
                    onDoubleClick={() => pinFile(tab.fileId)}
                    onAuxClick={(e) => {
                      // Middle-click to close
                      if (e.button === 1) {
                        e.preventDefault();
                        closeTab(tab.fileId);
                      }
                    }}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                    )}

                    {/* File icon */}
                    <FileIcon className="h-3.5 w-3.5" />

                    {/* File name — italic if temporary (preview) */}
                    <span
                      className={cn(
                        "text-xs truncate",
                        !tab.isPinned && "italic opacity-80",
                        isActive && "font-medium",
                      )}
                    >
                      {file.name}
                    </span>

                    {/* Close button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(tab.fileId);
                      }}
                      className={cn(
                        "ml-1 p-0.5 rounded-sm transition-colors shrink-0",
                        isActive
                          ? "hover:bg-muted/60 text-muted-foreground hover:text-foreground opacity-100"
                          : "opacity-0 group-hover:opacity-100 hover:bg-muted/60 text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );

                return activeProject ? (
                  <ExplorerContextMenu
                    key={tab.fileId}
                    node={fileNode}
                    projectId={activeProject.id}
                  >
                    {tabContent}
                  </ExplorerContextMenu>
                ) : (
                  tabContent
                );
              })}
            </div>
          )}

          {/* Spacer — pushes mode tabs + export to the right */}
          <div className="flex-1" />

          {/* Mode tabs — Code / Preview */}
          <div className="relative flex items-stretch border-l shrink-0">
            {modeTabs.map((tab, i) => {
              const isActive = activeMode === tab.id;
              const Icon = tab.icon;
              return (
                <Tooltip key={tab.id}>
                  <TooltipTrigger asChild>
                    <button
                      ref={(el) => {
                        tabRefs.current[i] = el;
                      }}
                      onClick={() => setActiveMode(tab.id)}
                      className={cn(
                        "relative flex items-center justify-center w-10 h-full border-r transition-colors duration-200",
                        isActive
                          ? "text-foreground bg-muted/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/10",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8}>
                    {tab.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}

            {/* Sliding active underline indicator */}
            <div
              ref={indicatorRef}
              className="absolute bottom-0 h-[2px] bg-primary rounded-full pointer-events-none"
              style={{ width: 0 }}
            />
          </div>

          {/* GitHub Export */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleExport}
                className="flex items-center justify-center w-10 h-full border-l text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors duration-200 shrink-0"
              >
                <Github className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              Export to GitHub
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      {/* ── File path breadcrumb ─────────────────────────────────── */}
      <FileBreadcrumb />

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex-1 relative bg-muted/10">
        <div
          ref={contentWrapperRef}
          className="absolute inset-0 overflow-y-auto"
        >
          {activeMode === "code" && <CodeView />}
          {activeMode === "preview" && <PreviewView />}
        </div>
      </div>
    </div>
  );
}

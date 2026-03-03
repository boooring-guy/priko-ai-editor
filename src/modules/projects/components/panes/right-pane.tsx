"use client";

import React, { useRef, useState } from "react";
import { Files, Search, GitBranch, ScrollText } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { ExplorerPanel } from "./explorer/explorer-panel";
import { SearchPanel } from "./explorer/search-panel";
import { GitPanel } from "./explorer/git-panel";
import { LogsPanel } from "./explorer/logs-panel";

// ── Tab definitions ───────────────────────────────────────────────────────────
const TABS = [
  { id: "explorer", label: "Explorer", icon: Files },
  { id: "search", label: "Search", icon: Search },
  { id: "git", label: "Source Control", icon: GitBranch },
  { id: "logs", label: "Output & Logs", icon: ScrollText },
] as const;

type TabId = (typeof TABS)[number]["id"];

const PANELS: Record<TabId, React.ReactNode> = {
  explorer: <ExplorerPanel />,
  search: <SearchPanel />,
  git: <GitPanel />,
  logs: <LogsPanel />,
};

// ── RightPane ─────────────────────────────────────────────────────────────────
export function RightPane() {
  const [activeTab, setActiveTab] = useState<TabId>("explorer");
  const contentRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Animate indicator + panel on tab change
  useGSAP(
    () => {
      const idx = TABS.findIndex((t) => t.id === activeTab);
      const el = tabRefs.current[idx];

      // Slide indicator
      if (el && indicatorRef.current) {
        gsap.to(indicatorRef.current, {
          x: el.offsetLeft,
          width: el.offsetWidth,
          duration: 0.4,
          ease: "power4.out",
        });
      }

      // Fade + lift panel
      if (contentRef.current) {
        gsap.fromTo(
          contentRef.current,
          { opacity: 0, y: 6 },
          { opacity: 1, y: 0, duration: 0.25, ease: "power3.out" },
        );
      }
    },
    { dependencies: [activeTab] },
  );

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full w-full bg-background/50 border-l overflow-hidden">
        {/* ── Top tab bar ──────────────────────────────────── */}
        <div className="relative flex items-center h-10 border-b border-border/50 px-1 bg-muted/10 shrink-0">
          {/* Sliding underline indicator */}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-[2px] bg-primary rounded-full"
            style={{ width: 0 }}
          />

          {TABS.map((tab, i) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;

            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative z-10 flex items-center justify-center w-10 h-full transition-colors duration-200 ${
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={4}>
                  {tab.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* ── Panel content ────────────────────────────────── */}
        <div ref={contentRef} className="flex-1 overflow-hidden">
          {PANELS[activeTab]}
        </div>
      </div>
    </TooltipProvider>
  );
}

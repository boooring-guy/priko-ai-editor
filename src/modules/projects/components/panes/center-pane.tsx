"use client";

import React, { useRef, useState } from "react";
import { Code2, Eye, Github } from "lucide-react";
import { toast } from "sonner";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

import { CodeView } from "./code-view";
import { PreviewView } from "./preview-view";

const tabs = [
  { id: "code", label: "Code", icon: Code2 },
  { id: "preview", label: "Preview", icon: Eye },
];

export function CenterPane() {
  const [activeTab, setActiveTab] = useState("code");
  const indicatorRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const handleExport = () => {
    toast.success("Exporting to GitHub...");
  };

  useGSAP(() => {
    // Animate sliding bottom-border indicator
    const activeIndex = tabs.findIndex((t) => t.id === activeTab);
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
  }, [activeTab]);

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden relative">
      {/* ── Header bar ──────────────────────────────────────────── */}
      <div className="relative h-10 border-b flex items-stretch shrink-0 bg-background z-10">
        {/* Tabs — flush, full-height, divided */}
        <div className="relative flex items-stretch">
          {tabs.map((tab, i) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-1.5 px-4 h-full border-r transition-colors duration-200 text-xs font-semibold uppercase tracking-wider",
                  isActive
                    ? "text-foreground bg-muted/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/10",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}

          {/* Sliding active underline indicator */}
          <div
            ref={indicatorRef}
            className="absolute bottom-0 h-[2px] bg-primary rounded-full pointer-events-none"
            style={{ width: 0 }}
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* GitHub Export — ghost, bordered-left, compartmentalized */}
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-4 h-full border-l text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/10 transition-colors duration-200"
        >
          <Github className="h-3.5 w-3.5" />
          Export
        </button>
      </div>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="flex-1 relative bg-muted/10">
        <div
          ref={contentWrapperRef}
          className="absolute inset-0 overflow-y-auto"
        >
          {activeTab === "code" && <CodeView />}
          {activeTab === "preview" && <PreviewView />}
        </div>
      </div>
    </div>
  );
}

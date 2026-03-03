"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Info,
  TriangleAlert,
  AlertCircle,
  Terminal,
  Trash2,
  ArrowDown,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── Types ─────────────────────────────────────────────────────────────────────
type LogLevel = "info" | "warn" | "error";
type LogEntry = { level: LogLevel; time: string; msg: string };

const LEVEL_ICON: Record<LogLevel, React.ReactNode> = {
  info: <Info className="h-3 w-3 text-blue-400 flex-shrink-0" />,
  warn: <TriangleAlert className="h-3 w-3 text-yellow-400 flex-shrink-0" />,
  error: <AlertCircle className="h-3 w-3 text-red-400 flex-shrink-0" />,
};

const LEVEL_COLOR: Record<LogLevel, string> = {
  info: "text-foreground/70",
  warn: "text-yellow-400",
  error: "text-red-400",
};

// ── Panel ─────────────────────────────────────────────────────────────────────
// Logs will be populated via a future real-time log streaming service.
// For now the panel displays a ready empty state.
export function LogsPanel() {
  const [filter, setFilter] = useState<LogLevel | "all">("all");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const viewportRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    viewportRef.current?.scrollTo({
      top: viewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  const visible =
    filter === "all" ? logs : logs.filter((l) => l.level === filter);

  const counts: Record<LogLevel, number> = {
    info: logs.filter((l) => l.level === "info").length,
    warn: logs.filter((l) => l.level === "warn").length,
    error: logs.filter((l) => l.level === "error").length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-1">
          <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Output
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            title="Scroll to bottom"
            onClick={scrollToBottom}
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            title="Clear logs"
            onClick={() => setLogs([])}
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/40 shrink-0">
        {(["all", "info", "warn", "error"] as const).map((lvl) => (
          <button
            key={lvl}
            onClick={() => setFilter(lvl)}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
              filter === lvl
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            {lvl !== "all" && LEVEL_ICON[lvl]}
            <span className="uppercase tracking-wide">{lvl}</span>
            {lvl !== "all" && counts[lvl] > 0 && (
              <span className="opacity-60">{counts[lvl]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Log entries */}
      <ScrollArea className="flex-1" ref={viewportRef as any}>
        <div className="p-2 space-y-0.5 font-mono">
          {visible.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center mt-10">
              No logs yet
            </p>
          ) : (
            visible.map((log, i) => (
              <div
                key={i}
                className="flex items-start gap-2 text-[11px] leading-5 group"
              >
                <span className="text-muted-foreground/40 w-14 flex-shrink-0 text-right group-hover:text-muted-foreground transition-colors">
                  {log.time}
                </span>
                {LEVEL_ICON[log.level]}
                <span className={`${LEVEL_COLOR[log.level]} break-all`}>
                  {log.msg}
                </span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

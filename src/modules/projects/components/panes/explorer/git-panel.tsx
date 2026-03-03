"use client";

import React, { useState } from "react";
import {
  GitCommit,
  GitPullRequest,
  GitMerge,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Plus,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// Git panel is purely UI/local-state for now.
// Real git integration (status, diff, commit) requires a backend git service —
// this component is wired up to accept data once that layer is ready.

type FileStatus = "modified" | "added" | "deleted" | "untracked";

const STATUS_BADGE: Record<FileStatus, { label: string; color: string }> = {
  added: { label: "A", color: "text-green-500" },
  modified: { label: "M", color: "text-yellow-500" },
  deleted: { label: "D", color: "text-red-500" },
  untracked: { label: "U", color: "text-blue-400" },
};

function FileRow({ file, status }: { file: string; status: FileStatus }) {
  const badge = STATUS_BADGE[status];
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-[3px] hover:bg-muted/40 cursor-pointer group">
      <div className="flex items-center gap-1.5 min-w-0">
        <button
          title="Stage"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
        >
          <Plus className="h-3 w-3 text-muted-foreground" />
        </button>
        <button
          title="Discard"
          className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
        >
          <RotateCcw className="h-3 w-3 text-muted-foreground" />
        </button>
        <span className="text-xs truncate text-foreground/80 group-hover:text-foreground font-mono">
          {file}
        </span>
      </div>
      <span className={`text-[10px] font-bold flex-shrink-0 ${badge.color}`}>
        {badge.label}
      </span>
    </div>
  );
}

function Section({
  label,
  count,
  children,
}: {
  label: string;
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-1.5 px-3 py-1 hover:bg-muted/30 text-left"
      >
        {open ? (
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-3 w-3 text-muted-foreground" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span className="ml-auto text-[10px] bg-muted rounded-full px-1.5 text-muted-foreground">
          {count}
        </span>
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
export function GitPanel() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Source Control
        </span>
        <div className="flex items-center gap-0.5">
          <button
            title="Pull"
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <GitPullRequest className="h-3.5 w-3.5" />
          </button>
          <button
            title="Push"
            className="p-1 rounded hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-colors"
          >
            <GitMerge className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Branch indicator */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/40 shrink-0">
        <GitCommit className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground font-mono">main</span>
      </div>

      {/* Commit input */}
      <div className="p-2 border-b border-border/40 space-y-1.5 shrink-0">
        <textarea
          rows={2}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Message (⌘Enter to commit)"
          className="w-full bg-muted/50 border border-border/50 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 resize-none transition font-mono"
        />
        <button
          disabled={!message.trim()}
          className="w-full flex items-center justify-center gap-1.5 bg-primary/90 hover:bg-primary disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground text-xs font-semibold py-1.5 rounded-md transition-colors"
        >
          <GitCommit className="h-3 w-3" />
          Commit to main
        </button>
      </div>

      {/* File sections — empty states until git service is connected */}
      <ScrollArea className="flex-1">
        <div className="py-1 space-y-1">
          <Section label="Staged" count={0}>
            <p className="text-xs text-muted-foreground text-center py-3 px-4">
              No staged changes
            </p>
          </Section>
          <Section label="Changes" count={0}>
            <p className="text-xs text-muted-foreground text-center py-3 px-4">
              No changes detected
            </p>
          </Section>
        </div>
      </ScrollArea>
    </div>
  );
}

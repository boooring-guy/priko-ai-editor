"use client";

import React, { useState } from "react";
import { CaseSensitive, Regex, Replace } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

// ── Panel ─────────────────────────────────────────────────────────────────────
export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [replace, setReplace] = useState("");
  const [showReplace, setShowReplace] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border/40 shrink-0">
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Search
        </span>
        <div className="flex items-center gap-0.5">
          <button
            title="Toggle Replace"
            onClick={() => setShowReplace((v) => !v)}
            className={`p-1 rounded transition-colors ${
              showReplace
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Replace className="h-3.5 w-3.5" />
          </button>
          <button
            title="Match Case"
            onClick={() => setCaseSensitive((v) => !v)}
            className={`p-1 rounded transition-colors ${
              caseSensitive
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <CaseSensitive className="h-3.5 w-3.5" />
          </button>
          <button
            title="Use Regex"
            onClick={() => setUseRegex((v) => !v)}
            className={`p-1 rounded transition-colors ${
              useRegex
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
            }`}
          >
            <Regex className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="p-2 space-y-1.5 border-b border-border/40 shrink-0">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="w-full bg-muted/50 border border-border/50 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 transition"
        />
        {showReplace && (
          <div className="flex gap-1">
            <input
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder="Replace…"
              className="flex-1 bg-muted/50 border border-border/50 rounded-md px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50 transition"
            />
            <button className="px-2 py-1 text-[10px] bg-muted hover:bg-muted/80 border border-border/50 rounded-md font-semibold transition-colors">
              All
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <ScrollArea className="flex-1">
        <div className="p-3">
          {!query ? (
            <p className="text-xs text-muted-foreground text-center mt-6">
              Type to search across all files
            </p>
          ) : (
            <p className="text-xs text-muted-foreground text-center mt-6">
              Search not yet connected
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

import { Cloud, CloudOff, Loader2 } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

export type SaveStatus = "saved" | "saving" | "error";

interface ProjectStatusBadgeProps {
  status: SaveStatus;
  className?: string;
}

export function ProjectStatusBadge({
  status,
  className,
}: ProjectStatusBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors cursor-default",
        {
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400":
            status === "saved",
          "bg-blue-500/10 text-blue-600 dark:text-blue-400":
            status === "saving",
          "bg-red-500/10 text-red-600 dark:text-red-400": status === "error",
        },
        className,
      )}
    >
      {status === "saved" && (
        <>
          <Cloud className="size-3.5" />
          <span>Saved</span>
        </>
      )}
      {status === "saving" && (
        <>
          <Loader2 className="size-3.5 animate-spin" />
          <span>Saving</span>
        </>
      )}
      {status === "error" && (
        <>
          <CloudOff className="size-3.5" />
          <span>Failed to save</span>
        </>
      )}
    </div>
  );
}

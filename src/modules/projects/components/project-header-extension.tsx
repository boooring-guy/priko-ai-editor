"use client";

import React, { useState, useEffect } from "react";
import { ProjectStatusBadge, type SaveStatus } from "./project-status-badge";
import { Button } from "@/components/ui/button";
import { Play, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ProjectHeaderExtension() {
  // Mock status for now to demonstrate UI
  const [status, setStatus] = useState<SaveStatus>("saved");

  // Just an example simulation of an auto-save cycle for presentation.
  // We can listen to custom events dispatched by the editor.
  useEffect(() => {
    const handleSaveStart = () => setStatus("saving");
    const handleSaveEnd = () => setStatus("saved");
    const handleSaveError = () => setStatus("error");

    window.addEventListener("save-start", handleSaveStart);
    window.addEventListener("save-end", handleSaveEnd);
    window.addEventListener("save-error", handleSaveError);

    return () => {
      window.removeEventListener("save-start", handleSaveStart);
      window.removeEventListener("save-end", handleSaveEnd);
      window.removeEventListener("save-error", handleSaveError);
    };
  }, []);

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <ProjectStatusBadge status={status} />

      {/* Desktop view actions */}
      <div className="hidden sm:flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Play className="size-3" />
          Run
        </Button>
      </div>

      {/* Mobile view dropdown actions */}
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="size-4" />
              <span className="sr-only">More options</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="gap-2">
              <Play className="size-4 text-muted-foreground" />
              <span>Run</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useRef, useState } from "react";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { PencilIcon, Play, MoreVertical, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectStatusBadge, type SaveStatus } from "./project-status-badge";
import { RenameProjectModal } from "./rename-project-modal";
import { useRenameProject } from "../hooks";
import { activeProjectAtom } from "../store/project-atoms";

export function ProjectHeaderExtension() {
  const [status, setStatus] = useState<SaveStatus>("saved");
  const [activeProject, setActiveProject] = useAtom(activeProjectAtom);
  const router = useRouter();
  const { mutateAsync: renameProject, isPending: isRenaming } =
    useRenameProject();

  // Inline editing state
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Rename-modal state
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [pendingName, setPendingName] = useState("");

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

  const startEditing = () => {
    if (!activeProject) return;
    setDraft(activeProject.name);
    setEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }, 30);
  };

  const commitEdit = () => {
    const trimmed = draft.trim();
    if (!trimmed || !activeProject || trimmed === activeProject.name) {
      setEditing(false);
      return;
    }
    setPendingName(trimmed);
    setRenameModalOpen(true);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitEdit();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      cancelEdit();
    }
  };

  const handleRenameConfirm = async (newName: string) => {
    if (!activeProject) return;
    try {
      await renameProject({ projectId: activeProject.id, newName });

      // Update the active project atom
      const updatedProject = {
        ...activeProject,
        name: newName,
        projectname: newName,
        updatedAt: new Date().toISOString(),
      };
      setActiveProject(updatedProject);

      toast.success(`Project renamed to "${newName}"`);
      setRenameModalOpen(false);

      // Navigate to new URL
      router.replace(`/projects/${activeProject.username}/${newName}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to rename project");
    }
  };

  return (
    <div className="flex items-center gap-1 sm:gap-3">
      <ProjectStatusBadge status={status} />

      {/* Editable project name — desktop */}
      {activeProject && (
        <div className="hidden sm:flex items-center">
          {editing ? (
            <div className="flex items-center gap-1">
              <input
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={handleKeyDown}
                className="text-sm font-semibold bg-transparent border-b border-primary outline-none max-w-[180px] py-0.5"
              />
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  commitEdit();
                }}
                className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Confirm rename"
              >
                <Check className="size-3.5" />
              </button>
              <button
                onMouseDown={(e) => {
                  e.preventDefault();
                  cancelEdit();
                }}
                className="p-0.5 rounded text-muted-foreground hover:text-foreground transition-colors"
                title="Cancel rename"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="group flex items-center gap-1 text-sm font-semibold text-foreground/80 hover:text-foreground transition-colors rounded px-1 py-0.5 hover:bg-muted/40"
              title="Click to rename project"
            >
              {activeProject.name}
              <PencilIcon className="size-3 opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
          )}
        </div>
      )}

      {/* Desktop action buttons */}
      <div className="hidden sm:flex items-center gap-2">
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Play className="size-3" />
          Run
        </Button>
      </div>

      {/* Mobile dropdown */}
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
            {activeProject && (
              <DropdownMenuItem
                className="gap-2"
                onClick={() => {
                  setPendingName(activeProject.name);
                  setRenameModalOpen(true);
                }}
              >
                <PencilIcon className="size-4 text-muted-foreground" />
                <span>Rename Project</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rename warning modal */}
      <RenameProjectModal
        open={renameModalOpen}
        currentName={activeProject?.name ?? ""}
        pendingName={pendingName}
        onConfirm={handleRenameConfirm}
        onCancel={() => setRenameModalOpen(false)}
        isPending={isRenaming}
      />
    </div>
  );
}

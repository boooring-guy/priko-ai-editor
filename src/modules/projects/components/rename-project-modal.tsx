"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RenameProjectModalProps {
  open: boolean;
  currentName: string;
  pendingName: string;
  onConfirm: (newName: string) => void;
  onCancel: () => void;
  isPending?: boolean;
}

export function RenameProjectModal({
  open,
  currentName,
  pendingName,
  onConfirm,
  onCancel,
  isPending = false,
}: RenameProjectModalProps) {
  const [name, setName] = useState(pendingName);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync name when pendingName changes (e.g. modal re-opened with different value)
  useEffect(() => {
    if (open) {
      setName(pendingName);
      setError(null);
    }
  }, [open, pendingName]);

  // Auto-focus and select text on open
  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  const validate = (value: string): string | null => {
    const v = value.trim();
    if (!v) return "Project name cannot be empty";
    if (!/^[a-zA-Z0-9_-]+$/.test(v))
      return "Only letters, numbers, hyphens, and underscores are allowed";
    if (v.length > 100) return "Name must be 100 characters or fewer";
    return null;
  };

  const handleConfirm = () => {
    const err = validate(name);
    if (err) {
      setError(err);
      return;
    }
    onConfirm(name.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
    if (e.key === "Escape") {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Rename Project
          </DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-3 pt-1">
              {/* Warning banner */}
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-amber-600 dark:text-amber-400">
                <p className="font-semibold">⚠ This changes your project URL</p>
                <p className="mt-1 text-xs leading-relaxed opacity-90">
                  Renaming{" "}
                  <span className="font-mono font-bold">{currentName}</span>{" "}
                  will move it to a new URL. Any links you have previously
                  shared will{" "}
                  <span className="font-semibold">stop working</span>.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Enter a new name for your project below.
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1.5 py-1">
          <Label htmlFor="rename-project-input" className="text-sm">
            New project name
          </Label>
          <Input
            id="rename-project-input"
            ref={inputRef}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="my-project"
            className={error ? "border-destructive ring-destructive/30" : ""}
            disabled={isPending}
          />
          {error && <p className="text-xs text-destructive mt-1">{error}</p>}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isPending || !name.trim() || name.trim() === currentName}
          >
            {isPending ? "Renaming…" : "Rename Project"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

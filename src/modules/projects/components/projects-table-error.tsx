"use client";

import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProjectsTableErrorProps {
  error?: Error | null;
  resetErrorBoundary?: () => void;
}

export function ProjectsTableError({
  error,
  resetErrorBoundary,
}: ProjectsTableErrorProps) {
  return (
    <div className="p-12 rounded-xl border border-destructive/20 bg-destructive/5 flex flex-col items-center justify-center gap-4 text-destructive shadow-sm min-h-[400px] w-full">
      <div className="p-3 bg-destructive/10 rounded-full">
        <AlertCircle className="size-8" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Failed to load projects</h3>
        <p className="text-sm text-destructive/80 max-w-md">
          {error?.message ||
            "An unexpected error occurred while fetching the projects. Please try again."}
        </p>
      </div>
      {resetErrorBoundary && (
        <Button
          variant="outline"
          size="sm"
          onClick={resetErrorBoundary}
          className="mt-4 border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
        >
          <RefreshCcw className="mr-2 size-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

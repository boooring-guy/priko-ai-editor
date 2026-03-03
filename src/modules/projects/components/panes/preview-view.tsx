import React from "react";
import { Eye } from "lucide-react";

export function PreviewView() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-background/50 text-center backdrop-blur-sm">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted/40">
        <Eye className="h-6 w-6 text-foreground/70" />
      </div>
      <p className="text-base font-medium text-foreground">Project Preview</p>
      <p className="mt-2 max-w-[250px] text-sm text-muted-foreground">
        Live compilation results and preview will be rendered here.
      </p>
    </div>
  );
}

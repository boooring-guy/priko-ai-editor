import React from "react";
import { Code2 } from "lucide-react";

export function CenterPane() {
  return (
    <div className="flex flex-col h-full w-full bg-background">
      <div className="h-12 border-b flex items-center px-4 bg-muted/30">
        <Code2 className="h-4 w-4 mr-2 text-primary" />
        <h2 className="text-sm font-mono">Editor</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground">
          PriKo Editor will go here.
        </p>
      </div>
    </div>
  );
}

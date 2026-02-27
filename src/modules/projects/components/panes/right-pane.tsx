import React from "react";
import { FolderGit2 } from "lucide-react";

export function RightPane() {
  return (
    <div className="flex flex-col h-full w-full bg-background/50 border-l">
      <div className="h-12 border-b flex items-center px-4">
        <FolderGit2 className="h-4 w-4 mr-2" />
        <h2 className="text-sm font-semibold">Explorer</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground">
          File Explorere and Git Status will go here.
        </p>
      </div>
    </div>
  );
}

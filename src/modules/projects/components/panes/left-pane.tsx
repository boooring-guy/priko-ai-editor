import React from "react";
import { MessageSquare } from "lucide-react";

export function LeftPane() {
  return (
    <div className="flex flex-col h-full w-full bg-background/50 border-r">
      <div className="h-12 border-b flex items-center px-4">
        <MessageSquare className="h-4 w-4 mr-2" />
        <h2 className="text-sm font-semibold">Conversation</h2>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        <p className="text-sm text-muted-foreground">
          Beautiful Conversation with AI will go here.
        </p>
      </div>
    </div>
  );
}

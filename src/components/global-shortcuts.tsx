"use client";

import { useEffect } from "react";

export function GlobalShortcuts() {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore all shortcuts when the user is typing in an editable element
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }

      // Global Theme Switcher Shortcut (Cmd/Ctrl + T)
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-theme-switcher"));
      }

      // Left Pane (Conversation)
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-left-pane"));
      }

      // Right Pane (Explorer)
      if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-right-pane"));
      }

      // Bottom Pane (Terminal)
      if (e.key === "j" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("toggle-bottom-pane"));
      }

      // Global New Project (Cmd/Ctrl + I) for Import maybe?
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent("open-import-project"));
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null;
}

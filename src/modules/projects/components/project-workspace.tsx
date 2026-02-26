"use client";

import React, { useEffect, useRef } from "react";
import type { PanelImperativeHandle } from "react-resizable-panels";
import { useDefaultLayout } from "react-resizable-panels";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import config from "@/config.json";
import { CenterPane } from "./panes/center-pane";
import { LeftPane } from "./panes/left-pane";
import { RightPane } from "./panes/right-pane";

export function ProjectWorkspace() {
  const leftPaneRef = useRef<PanelImperativeHandle>(null);
  const rightPaneRef = useRef<PanelImperativeHandle>(null);
  const bottomPaneRef = useRef<PanelImperativeHandle>(null);

  const layoutCfg =
    (config as any).editor?.layout || (config as any).app?.editor?.layout;

  // Persist & restore the main horizontal layout (left | center | right)
  const mainLayout = useDefaultLayout({
    id: "priko:main-layout",
    panelIds: ["left-pane", "center-pane", "right-pane"],
    storage: localStorage,
  });

  // Persist & restore the inner vertical layout (editor | terminal)
  const centerSplitLayout = useDefaultLayout({
    id: "priko:center-split-layout",
    panelIds: ["editor-pane", "terminal-pane"],
    storage: localStorage,
  });

  // Setup event listeners for the toggles dispatched from `global-shortcuts.tsx`
  useEffect(() => {
    const handleToggleLeftPane = () => {
      const panel = leftPaneRef.current;
      if (panel) {
        if (panel.isCollapsed()) {
          panel.expand();
        } else {
          panel.collapse();
        }
      }
    };

    const handleToggleRightPane = () => {
      const panel = rightPaneRef.current;
      if (panel) {
        if (panel.isCollapsed()) {
          panel.expand();
        } else {
          panel.collapse();
        }
      }
    };

    const handleToggleBottomPane = () => {
      const panel = bottomPaneRef.current;
      if (panel) {
        if (panel.isCollapsed()) {
          panel.expand();
        } else {
          panel.collapse();
        }
      }
    };

    window.addEventListener("toggle-left-pane", handleToggleLeftPane);
    window.addEventListener("toggle-right-pane", handleToggleRightPane);
    window.addEventListener("toggle-bottom-pane", handleToggleBottomPane);

    return () => {
      window.removeEventListener("toggle-left-pane", handleToggleLeftPane);
      window.removeEventListener("toggle-right-pane", handleToggleRightPane);
      window.removeEventListener("toggle-bottom-pane", handleToggleBottomPane);
    };
  }, []);

  return (
    <ResizablePanelGroup
      orientation="horizontal"
      className="h-full w-full"
      defaultLayout={
        mainLayout.defaultLayout ?? {
          "left-pane": layoutCfg.leftPane.defaultSize,
          "center-pane": layoutCfg.centerPane.defaultSize,
          "right-pane": layoutCfg.rightPane.defaultSize,
        }
      }
      onLayoutChanged={mainLayout.onLayoutChanged}
    >
      {/* LEFT PANE (Conversation) */}
      <ResizablePanel
        id="left-pane"
        panelRef={leftPaneRef}
        minSize={layoutCfg.leftPane.minSize}
        collapsedSize={layoutCfg.leftPane.collapsedSize}
        collapsible={true}
      >
        <LeftPane />
      </ResizablePanel>

      <ResizableHandle />

      {/* CENTER PANE (Editor + Terminal vertically split) */}
      <ResizablePanel id="center-pane" minSize={layoutCfg.centerPane.minSize}>
        <ResizablePanelGroup
          orientation="vertical"
          className="h-full w-full"
          defaultLayout={
            centerSplitLayout.defaultLayout ?? {
              "editor-pane": layoutCfg.centerSplit.editor.defaultSize,
              "terminal-pane": layoutCfg.centerSplit.terminal.defaultSize,
            }
          }
          onLayoutChanged={centerSplitLayout.onLayoutChanged}
        >
          {/* Top of Center: Editor */}
          <ResizablePanel
            id="editor-pane"
            minSize={layoutCfg.centerSplit.editor.minSize}
          >
            <CenterPane />
          </ResizablePanel>

          <ResizableHandle />

          {/* Bottom of Center: Terminal */}
          <ResizablePanel
            id="terminal-pane"
            panelRef={bottomPaneRef}
            minSize={layoutCfg.centerSplit.terminal.minSize}
            collapsedSize={layoutCfg.centerSplit.terminal.collapsedSize}
            collapsible={true}
          >
            <div className="h-full bg-background border-t">
              <div className="h-10 border-b flex items-center px-4 bg-muted/40 text-sm font-semibold">
                Terminal
              </div>
              <div className="p-4 text-sm text-muted-foreground">
                Beautiful Terminal will go here.
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>

      <ResizableHandle />

      {/* RIGHT PANE (Explorer) */}
      <ResizablePanel
        id="right-pane"
        panelRef={rightPaneRef}
        minSize={layoutCfg.rightPane.minSize}
        collapsedSize={layoutCfg.rightPane.collapsedSize}
        collapsible={true}
      >
        <RightPane />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

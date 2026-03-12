"use client";
import { version } from "@/../package.json";
import React from "react";
import { Command, Search, Layout, FileSearch } from "lucide-react";
import Logo from "@/components/logo";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function WelcomeView() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".animate-item"),
        { opacity: 0, y: 20, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: "power4.out",
        },
      );
    }
  }, []);

  const shortcuts = [
    { icon: FileSearch, label: "Search Files", shortcut: "⌘ P" },
    { icon: Search, label: "Global Search", shortcut: "⌘ ⇧ F" },
    { icon: Layout, label: "Toggle Sidebar", shortcut: "⌘ B" },
    { icon: Command, label: "Command Palette", shortcut: "⌘ ⇧ P" },
  ];

  return (
    <div
      ref={containerRef}
      className="flex h-full w-full flex-col items-center justify-center bg-background p-8"
    >
      <div className="animate-item mb-8">
        <Logo size={120} className="text-primary/20" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-2xl w-full animate-item">
        {shortcuts.map((item, index) => (
          <div
            key={index}
            className="group flex items-center justify-between gap-6 rounded-xl border border-border/50 bg-muted/20 p-4 transition-all hover:border-primary/30 hover:bg-muted/40"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <item.icon className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate whitespace-nowrap">
                {item.label}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {item.shortcut.split(" ").map((key, i) => (
                <kbd
                  key={i}
                  className="pointer-events-none flex h-5 min-w-[20px] select-none items-center justify-center rounded border bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground"
                >
                  {key}
                </kbd>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="animate-item mt-12 text-center">
        <p className="text-xs text-muted-foreground/40 font-medium tracking-widest uppercase">
          PRIKO EDITOR v{version}
        </p>
      </div>
    </div>
  );
}

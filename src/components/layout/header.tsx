"use client";

import type React from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { UserButton } from "@/modules/auth/components/user-button";
import { AdaptiveBreadcrumbs } from "./adaptive-breadcrumbs";
import Logo from "../logo";

interface HeaderProps {
  className?: string;
  // Allows optional overrides for breadcrumbs, otherwise uses path auto-generation
  breadcrumbItems?: React.ComponentProps<typeof AdaptiveBreadcrumbs>["items"];
  // For future variations like "minimal" vs "full"
  variant?: "default" | "minimal";
  // Content to stick in the center or anywhere if needed
  startContent?: React.ReactNode;
  centerContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

export function Header({
  className,
  breadcrumbItems,
  variant = "default",
  startContent,
  centerContent,
  endContent,
}: HeaderProps) {
  return (
    <header className={cn("sticky top-0 z-40 w-full", className)}>
      {/* Main header bar */}
      <div className="relative bg-background/80 backdrop-blur-xl supports-backdrop-filter:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4 md:px-6 lg:px-8">
          {/* ── Left section ── */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Logo with subtle hover animation */}
            <div className="flex items-center gap-2.5 shrink-0 group cursor-default select-none">
              <div className="relative flex items-center justify-center">
                {/* Glow ring behind logo on hover */}
                <div className="absolute inset-0 rounded-lg bg-primary/0 group-hover:bg-primary/10 blur-md transition-all duration-500" />
                <Logo
                  size="lg"
                  className="relative transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <span className="hidden sm:inline-block text-sm font-semibold tracking-tight text-foreground/90">
                Priko
              </span>
            </div>

            {/* Separator */}
            <div className="hidden sm:block h-5 w-px bg-border/60" />

            {startContent}

            {variant === "default" && (
              <AdaptiveBreadcrumbs items={breadcrumbItems} />
            )}
          </div>

          {/* ── Center section ── */}
          {centerContent && (
            <div className="flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 justify-center">
              {centerContent}
            </div>
          )}

          {/* ── Right section ── */}
          <div className="flex items-center justify-end gap-2 flex-1">
            {endContent}
            <div className="flex items-center gap-1.5">
              <ThemeSwitcher />
              <UserButton />
            </div>
          </div>
        </div>

        {/* Bottom border with subtle gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>
    </header>
  );
}

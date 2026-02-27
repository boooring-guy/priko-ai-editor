"use client";

import type React from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { cn } from "@/lib/utils";
import { UserButton } from "@/modules/auth/components/user-button";
import { AdaptiveBreadcrumbs } from "./adaptive-breadcrumbs";

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
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60",
        className,
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4 flex-1">
          <div className="hidden sm:flex items-center gap-2 mr-2">
            <h1 className="text-xl font-bold tracking-tight">Priko</h1>
          </div>
          {startContent}
          {variant === "default" && (
            <AdaptiveBreadcrumbs items={breadcrumbItems} />
          )}
        </div>

        {centerContent && (
          <div className="flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 justify-center">
            {centerContent}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 flex-1">
          {endContent}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}

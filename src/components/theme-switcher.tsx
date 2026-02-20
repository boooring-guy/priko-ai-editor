"use client";

import { Check, Cloud, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type AppTheme, DEFAULT_THEME, THEME_OPTIONS } from "@/lib/themes";
import { cn } from "@/lib/utils";

const THEME_ICONS: Partial<
  Record<AppTheme, React.ComponentType<{ className?: string }>>
> = {
  latte: Sun,
  frappe: Cloud,
  macchiato: Palette,
  mocha: Moon,
  "ayu-light": Sun,
  "ayu-dark": Moon,
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = ((mounted ? theme : DEFAULT_THEME) ?? DEFAULT_THEME) as
    | AppTheme
    | "light"
    | "dark";
  const resolvedTheme =
    activeTheme === "dark"
      ? "mocha"
      : activeTheme === "light"
        ? "latte"
        : activeTheme;
  const ActiveThemeIcon = THEME_ICONS[resolvedTheme] ?? Palette;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative"
          aria-label="Toggle theme"
        >
          <ActiveThemeIcon className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {THEME_OPTIONS.map(({ value, label }) => {
          const Icon = THEME_ICONS[value] ?? Palette;
          return (
            <DropdownMenuItem key={value} onSelect={() => setTheme(value)}>
              <Icon className="h-4 w-4" />
              <span>{label}</span>
              <Check
                className={cn(
                  "ml-auto h-4 w-4 transition-opacity",
                  theme === value ? "opacity-100" : "opacity-0",
                )}
              />
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

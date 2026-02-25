"use client";

import {
  Check,
  Cloud,
  Github,
  Monitor,
  Moon,
  Palette,
  Sparkles,
  Sun,
  Triangle,
  Zap,
} from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
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
  "github-dark": Github,
  vercel: Triangle,
  dia: Sparkles,
  "dia-dark": Moon,
  "windows-xp": Monitor,
  gsap: Zap,
  "gsap-inspired": Zap,
};

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
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
    <>
      <Button
        variant="outline"
        size="icon"
        className="relative"
        aria-label="Toggle theme"
        onClick={() => setOpen(true)}
      >
        <ActiveThemeIcon className="h-[1.2rem] w-[1.2rem]" />
      </Button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Theme Switcher"
        description="Search inside our themes or view light and dark options."
      >
        <CommandInput placeholder="Search theme..." />
        <CommandList>
          <CommandEmpty>No theme found.</CommandEmpty>
          {["light", "dark"].map((appearance, index) => {
            const themesInGroup = THEME_OPTIONS.filter(
              (t) => t.appearance === appearance,
            );

            if (themesInGroup.length === 0) return null;

            return (
              <React.Fragment key={appearance}>
                {index > 0 && <CommandSeparator />}
                <CommandGroup
                  heading={`${appearance.charAt(0).toUpperCase() + appearance.slice(1)} Themes`}
                >
                  {themesInGroup.map(({ value, label }) => {
                    const Icon = THEME_ICONS[value] ?? Palette;
                    return (
                      <CommandItem
                        key={value}
                        value={value}
                        onSelect={(currentValue) => {
                          setTheme(currentValue);
                          setOpen(false);
                        }}
                      >
                        <Icon className="mr-2 h-4 w-4" />
                        <span>{label}</span>
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4 transition-opacity",
                            theme === value ? "opacity-100" : "opacity-0",
                          )}
                        />
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </React.Fragment>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}

"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { useEffect } from "react";
import { isDarkTheme } from "@/lib/themes";

function ThemeAppearanceSync() {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;

    if (isDarkTheme(theme)) {
      root.classList.add("dark");
      return;
    }

    root.classList.remove("dark");
  }, [theme]);

  return null;
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider {...props}>
      <ThemeAppearanceSync />
      {children}
    </NextThemesProvider>
  );
}

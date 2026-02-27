import { atomWithStorage } from "jotai/utils";
import { type AppTheme, DEFAULT_THEME } from "@/lib/themes";

/**
 * Raw string storage — matches next-themes localStorage format (no JSON encoding).
 * next-themes stores `mocha`, not `"mocha"`, so we must bypass atomWithStorage's
 * default JSON.stringify/parse to avoid a read-back mismatch that falls back to default.
 */
const rawStringStorage = {
  getItem: (key: string, initialValue: AppTheme): AppTheme => {
    if (typeof window === "undefined") return initialValue;
    return (localStorage.getItem(key) as AppTheme) ?? initialValue;
  },
  setItem: (key: string, value: AppTheme) => {
    localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    localStorage.removeItem(key);
  },
  subscribe: (
    key: string,
    callback: (value: AppTheme) => void,
    initialValue: AppTheme,
  ) => {
    const handler = (e: StorageEvent) => {
      if (e.key === key) callback((e.newValue as AppTheme) ?? initialValue);
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  },
};

/**
 * Tracks the current theme.
 * Uses the same localStorage key as next-themes so they stay in sync on mount and across tabs.
 */
export const themeAtom = atomWithStorage<AppTheme>(
  "theme",
  DEFAULT_THEME,
  rawStringStorage,
);

export type ActiveProject = {
  id: string;
  name: string;
  username: string;
  projectname: string;
  updatedAt: string;
} | null;

/**
 * Tracks the last project the user navigated to.
 * Backed by localStorage so it persists across page reloads and syncs across tabs.
 */
export const activeProjectAtom = atomWithStorage<ActiveProject>(
  "priko:active-project",
  null,
);

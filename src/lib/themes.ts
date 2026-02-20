export type ThemeAppearance = "light" | "dark";

export const THEME_OPTIONS = [
  { value: "latte", label: "Latte", appearance: "light" },
  { value: "frappe", label: "Frappe", appearance: "dark" },
  { value: "macchiato", label: "Macchiato", appearance: "dark" },
  { value: "mocha", label: "Mocha", appearance: "dark" },
  { value: "ayu-light", label: "Ayu Light", appearance: "light" },
  { value: "ayu-dark", label: "Ayu Dark", appearance: "dark" },
] as const satisfies readonly {
  value: string;
  label: string;
  appearance: ThemeAppearance;
}[];

export type AppTheme = (typeof THEME_OPTIONS)[number]["value"];

export const DEFAULT_THEME: AppTheme = "latte";

export const THEME_NAMES = THEME_OPTIONS.map(
  ({ value }) => value,
) as AppTheme[];

const DARK_THEMES = new Set<AppTheme>(
  THEME_OPTIONS.filter(({ appearance }) => appearance === "dark").map(
    ({ value }) => value,
  ),
);

export function isDarkTheme(theme?: string | null): boolean {
  if (!theme) return false;
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return DARK_THEMES.has(theme as AppTheme);
}

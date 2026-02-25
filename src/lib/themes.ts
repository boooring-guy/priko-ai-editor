import config from "@/config.json";

export type ThemeAppearance = "light" | "dark";

export const THEME_OPTIONS = config.app.theme.options as readonly {
  value: string;
  label: string;
  appearance: ThemeAppearance;
}[];

export type AppTheme = string;

export const DEFAULT_THEME: AppTheme = config.app.theme.default as AppTheme;

export const THEME_NAMES = THEME_OPTIONS.map(
  ({ value }) => value,
) as AppTheme[];

const DARK_THEMES = new Set<AppTheme>(
  THEME_OPTIONS.filter(({ appearance }) => appearance === "dark").map(
    ({ value }) => value,
  ),
);

const LEGACY_DARK_THEMES = new Set(["gsap-inspired"]);

export function isDarkTheme(theme?: string | null): boolean {
  if (!theme) return false;
  if (theme === "dark") return true;
  if (theme === "light") return false;
  if (LEGACY_DARK_THEMES.has(theme)) return true;
  return DARK_THEMES.has(theme as AppTheme);
}

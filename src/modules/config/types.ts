import type defaultConfig from "@/config.json";

/**
 * The full resolved application config shape.
 * Derived from the static `config.json` so it stays in sync automatically.
 */
export type AppConfig = typeof defaultConfig;

/**
 * A deeply-partial version of AppConfig used for user overrides stored in JSONB.
 */
export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type PartialAppConfig = DeepPartial<AppConfig>;

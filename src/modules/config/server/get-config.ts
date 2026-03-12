"use server";

import defaultConfig from "@/config.json";
import type { AppConfig, PartialAppConfig } from "../types";
import { getUserConfig } from "./config-actions";

/**
 * Returns the full resolved config for the current user.
 * User JSONB overrides are deep-merged on top of the static `config.json` defaults.
 *
 * If no user is signed in (or they have no config row yet), the plain defaults are returned.
 */
export async function getConfig(): Promise<AppConfig> {
  const overrides = await getUserConfig();

  if (!overrides) return defaultConfig as AppConfig;

  return deepMergeConfig(
    defaultConfig as Record<string, unknown>,
    overrides as Record<string, unknown>,
  ) as AppConfig;
}

/**
 * Returns the raw default config (no DB access).
 * Useful for client components or unauthenticated contexts.
 */
export async function getDefaultConfig(): Promise<AppConfig> {
  return defaultConfig as AppConfig;
}

// ─── helpers ────────────────────────────────────────────────────

function deepMergeConfig(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const output = { ...target };

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];

    if (
      srcVal &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      output[key] = deepMergeConfig(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>,
      );
    } else {
      output[key] = srcVal;
    }
  }

  return output;
}

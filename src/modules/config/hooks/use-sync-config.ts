"use client";

import { useSetAtom } from "jotai";
import { useEffect, useRef } from "react";
import defaultConfig from "@/config.json";
import { getUserConfig } from "@/modules/config/server/config-actions";
import { userConfigAtom } from "../store/config-atoms";

/**
 * Deep-merge user overrides onto defaults.
 */
function deepMerge(
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
      output[key] = deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>,
      );
    } else {
      output[key] = srcVal;
    }
  }
  return output;
}

/**
 * Fetches user config from DB on mount and hydrates the Jotai `userConfigAtom`.
 * Call this once near the app root (e.g. in Providers).
 */
export function useSyncConfig() {
  const setConfig = useSetAtom(userConfigAtom);
  const didSync = useRef(false);

  useEffect(() => {
    if (didSync.current) return;
    didSync.current = true;

    getUserConfig().then((overrides) => {
      if (overrides) {
        const merged = deepMerge(
          defaultConfig as Record<string, unknown>,
          overrides as Record<string, unknown>,
        );
        setConfig(merged as typeof defaultConfig);
      }
    });
  }, [setConfig]);
}

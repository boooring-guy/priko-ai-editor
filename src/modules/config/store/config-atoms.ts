import { atom } from "jotai";
import defaultConfig from "@/config.json";

/**
 * Full resolved app config.
 * Defaults to `config.json` and is hydrated with user DB overrides on mount.
 */
export type AppConfigType = typeof defaultConfig;

export const userConfigAtom = atom<AppConfigType>(
  defaultConfig as AppConfigType,
);

"use server";

import { eq } from "drizzle-orm";
import { db } from "@/db";
import { userConfig } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/server/get-current-user";
import type { PartialAppConfig } from "../types";

/**
 * Fetch the current user's config overrides from the database.
 * Returns the JSONB config object, or `null` if no row exists yet.
 */
export async function getUserConfig(): Promise<PartialAppConfig | null> {
  const currentUser = await getCurrentUser();
  if (!currentUser) return null;

  const [row] = await db
    .select({ config: userConfig.config })
    .from(userConfig)
    .where(eq(userConfig.userId, currentUser.id))
    .limit(1);

  return (row?.config as PartialAppConfig) ?? null;
}

/**
 * Upsert the current user's config overrides.
 * Deep-merges `partial` into any existing overrides already stored.
 */
export async function updateUserConfig(partial: PartialAppConfig) {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  // Fetch existing overrides so we can deep-merge
  const existing = await getUserConfig();
  const merged = deepMerge(existing ?? {}, partial);

  await db
    .insert(userConfig)
    .values({
      userId: currentUser.id,
      config: merged,
    })
    .onConflictDoUpdate({
      target: userConfig.userId,
      set: {
        config: merged,
        updatedAt: new Date(),
      },
    });

  return merged;
}

// ─── helpers ────────────────────────────────────────────────────

/**
 * Simple recursive deep-merge. `source` values overwrite `target` values.
 */
function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Record<string, unknown>,
): T {
  const output = { ...target } as Record<string, unknown>;

  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = (target as Record<string, unknown>)[key];

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

  return output as T;
}

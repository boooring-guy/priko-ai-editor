"use server";

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { files, projects } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/server/get-current-user";
import { deleteSchema, type DeleteInput } from "../shared/mutations.schema";

// ─── Shared helpers ───────────────────────────────────────────────────────────

async function requireProjectAccess(projectId: string, userId: string) {
  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.ownerId, userId),
      eq(projects.isDeleted, false),
    ),
    columns: { id: true },
  });
  if (!project) throw new Error("Project not found or access denied.");
  return project;
}

/**
 * Collects the IDs of `rootId` and every descendant from a pre-fetched flat
 * list. Runs in O(n) via an in-memory BFS — no extra DB queries.
 */
function collectDescendantIds(
  allFiles: { id: string; parentId: string | null }[],
  rootId: string,
): string[] {
  const childrenOf = new Map<string, string[]>();
  for (const f of allFiles) {
    if (!f.parentId) continue;
    const bucket = childrenOf.get(f.parentId) ?? [];
    bucket.push(f.id);
    childrenOf.set(f.parentId, bucket);
  }

  const ids: string[] = [];
  const queue: string[] = [rootId];
  while (queue.length > 0) {
    const current = queue.shift()!;
    ids.push(current);
    queue.push(...(childrenOf.get(current) ?? []));
  }
  return ids;
}

// ─── deleteFile ───────────────────────────────────────────────────────────────

/**
 * Soft-deletes a single plain **file** (`isDeleted = true`).
 *
 * Rules:
 *  - Caller must be authenticated.
 *  - Target must exist, be non-deleted, and be a `file` (use `deleteFolder`
 *    for directories).
 *
 * @param rawInput  `{ id, projectId }`
 * @returns         The updated (soft-deleted) FileSelect row.
 */
export const deleteFile = async (rawInput: DeleteInput) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const input = deleteSchema.parse(rawInput);

  await requireProjectAccess(input.projectId, currentUser.id);

  const target = await db.query.files.findFirst({
    where: and(
      eq(files.id, input.id),
      eq(files.projectId, input.projectId),
      eq(files.fileType, "file"),
      eq(files.isDeleted, false),
    ),
    columns: { id: true },
  });
  if (!target)
    throw new Error("File not found, already deleted, or is a directory.");

  const [deleted] = await db
    .update(files)
    .set({ isDeleted: true })
    .where(eq(files.id, input.id))
    .returning();

  return deleted;
};

// ─── deleteFolder ─────────────────────────────────────────────────────────────

/**
 * Soft-deletes a **directory and all of its descendants** in a single batch.
 *
 * Strategy (no N+1):
 *  1. One SELECT of all non-deleted project files.
 *  2. In-memory BFS collects the folder + every descendant ID.
 *  3. One `UPDATE … WHERE id IN (…)` marks them all soft-deleted.
 *
 * @param rawInput  `{ id, projectId }`
 * @returns         `{ deletedCount }` — total rows soft-deleted.
 */
export const deleteFolder = async (rawInput: DeleteInput) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const input = deleteSchema.parse(rawInput);

  await requireProjectAccess(input.projectId, currentUser.id);

  const target = await db.query.files.findFirst({
    where: and(
      eq(files.id, input.id),
      eq(files.projectId, input.projectId),
      eq(files.fileType, "directory"),
      eq(files.isDeleted, false),
    ),
    columns: { id: true },
  });
  if (!target)
    throw new Error(
      "Folder not found, already deleted, or is not a directory.",
    );

  // One query to get all project files, then walk in-memory
  const allProjectFiles = await db.query.files.findMany({
    where: and(
      eq(files.projectId, input.projectId),
      eq(files.isDeleted, false),
    ),
    columns: { id: true, parentId: true },
  });

  const idsToDelete = collectDescendantIds(allProjectFiles, input.id);
  if (idsToDelete.length === 0) return { deletedCount: 0 };

  const deleted = await db
    .update(files)
    .set({ isDeleted: true })
    .where(inArray(files.id, idsToDelete))
    .returning({ id: files.id });

  return { deletedCount: deleted.length };
};

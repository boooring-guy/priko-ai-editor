"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { files, projects } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/server/get-current-user";
import {
  type UpdateFileInput,
  updateFileSchema,
} from "../shared/mutations.schema";
import { formatContentOnSave } from "./format";

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

// ─── updateFile ───────────────────────────────────────────────────────────────

/**
 * Updates a plain **file** (content and/or contentType).
 *
 * Rules:
 *  - Caller must be authenticated.
 *  - Target must exist, be non-deleted, and be a `file` (directories cannot be updated here).
 *  - At least one field (content or contentType) must be provided (enforced by schema).
 *
 * @param rawInput  `{ id, projectId, content?, contentType? }`
 * @returns         The updated FileSelect row.
 */
export const updateFile = async (rawInput: UpdateFileInput) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const input = updateFileSchema.parse(rawInput);

  await requireProjectAccess(input.projectId, currentUser.id);

  const target = await db.query.files.findFirst({
    where: and(
      eq(files.id, input.id),
      eq(files.projectId, input.projectId),
      eq(files.fileType, "file"), // Reject directories
      eq(files.isDeleted, false),
    ),
    columns: {
      id: true,
      name: true,
      contentType: true,
    },
  });
  if (!target)
    throw new Error("File not found, already deleted, or is a directory.");

  const patch: Partial<typeof files.$inferInsert> = {};

  const nextContentType = input.contentType ?? target.contentType;
  if (input.content !== undefined) {
    if (nextContentType === "text") {
      patch.content = await formatContentOnSave(target.name, input.content);
    } else {
      patch.content = input.content;
    }
  }

  if (input.contentType !== undefined) patch.contentType = input.contentType;

  const [updated] = await db
    .update(files)
    .set(patch)
    .where(eq(files.id, input.id))
    .returning();

  return updated;
};

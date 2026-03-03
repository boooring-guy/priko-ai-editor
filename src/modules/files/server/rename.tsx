"use server";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { files, projects } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/server/get-current-user";
import { renameSchema, type RenameInput } from "../shared/mutations.schema";

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

async function checkDuplicate(
  projectId: string,
  parentId: string | null,
  name: string,
) {
  const duplicateFilter = parentId
    ? and(
        eq(files.projectId, projectId),
        eq(files.parentId, parentId),
        eq(files.name, name),
        eq(files.isDeleted, false),
      )
    : and(
        eq(files.projectId, projectId),
        isNull(files.parentId),
        eq(files.name, name),
        eq(files.isDeleted, false),
      );

  const conflict = await db.query.files.findFirst({
    where: duplicateFilter,
    columns: { id: true, fileType: true },
  });

  if (conflict) {
    const kind = conflict.fileType === "directory" ? "folder" : "file";
    throw new Error(
      `A ${kind} named "${name}" already exists in this location.`,
    );
  }
}

// ─── renameFile ───────────────────────────────────────────────────────────────

/**
 * Renames a plain **file** (not a directory).
 *
 * Rules:
 *  - Caller must be authenticated.
 *  - Target must exist, be non-deleted, and be a `file`.
 *  - No-op if the new name equals the current name.
 *  - New name must be unique within the same parent scope.
 *
 * @param rawInput  `{ id, projectId, name }`
 * @returns         The updated FileSelect row.
 */
export const renameFile = async (rawInput: RenameInput) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const input = renameSchema.parse(rawInput);

  await requireProjectAccess(input.projectId, currentUser.id);

  const target = await db.query.files.findFirst({
    where: and(
      eq(files.id, input.id),
      eq(files.projectId, input.projectId),
      eq(files.fileType, "file"),
      eq(files.isDeleted, false),
    ),
  });
  if (!target) throw new Error("File not found, deleted, or is a directory.");

  if (target.name === input.name) return target; // no-op

  await checkDuplicate(input.projectId, target.parentId, input.name);

  const [updated] = await db
    .update(files)
    .set({ name: input.name })
    .where(eq(files.id, input.id))
    .returning();

  return updated;
};

// ─── renameFolder ─────────────────────────────────────────────────────────────

/**
 * Renames a **directory** (not a plain file).
 *
 * Children are unaffected — they reference the parent by ID, not name.
 *
 * Rules:
 *  - Caller must be authenticated.
 *  - Target must exist, be non-deleted, and be a `directory`.
 *  - No-op if the new name equals the current name.
 *  - New name must be unique within the same parent scope.
 *
 * @param rawInput  `{ id, projectId, name }`
 * @returns         The updated FileSelect row.
 */
export const renameFolder = async (rawInput: RenameInput) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const input = renameSchema.parse(rawInput);

  await requireProjectAccess(input.projectId, currentUser.id);

  const target = await db.query.files.findFirst({
    where: and(
      eq(files.id, input.id),
      eq(files.projectId, input.projectId),
      eq(files.fileType, "directory"),
      eq(files.isDeleted, false),
    ),
  });
  if (!target)
    throw new Error("Folder not found, deleted, or is not a directory.");

  if (target.name === input.name) return target; // no-op

  await checkDuplicate(input.projectId, target.parentId, input.name);

  const [updated] = await db
    .update(files)
    .set({ name: input.name })
    .where(eq(files.id, input.id))
    .returning();

  return updated;
};

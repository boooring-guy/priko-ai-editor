"use server";

import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { files, projects } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/server/get-current-user";
import {
  createFileSchema,
  createFolderSchema,
  type CreateFileInput,
  type CreateFolderInput,
} from "../shared/create.schema";

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
  parentId: string | null | undefined,
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

  const existing = await db.query.files.findFirst({
    where: duplicateFilter,
    columns: { id: true, fileType: true },
  });

  if (existing) {
    const kind = existing.fileType === "directory" ? "folder" : "file";
    throw new Error(
      `A ${kind} named "${name}" already exists in this location.`,
    );
  }
}

// ─── createFile ───────────────────────────────────────────────────────────────

/**
 * Creates a new file (or directory) inside a project.
 *
 * Rules:
 *  - Caller must be authenticated.
 *  - Input validated against `createFileSchema` (name, projectId, fileType, …).
 *  - Name must be unique within the parent scope.
 *  - Directories are always stored with `content: null`.
 *  - Default `contentType` is "text".
 *
 * @param rawInput  `{ name, projectId, fileType, contentType?, content?, parentId? }`
 * @returns         The newly inserted FileSelect row.
 */
export const createFile = async (rawInput: CreateFileInput) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const input = createFileSchema.parse(rawInput);

  await requireProjectAccess(input.projectId, currentUser.id);
  await checkDuplicate(input.projectId, input.parentId, input.name);

  const [file] = await db
    .insert(files)
    .values({
      name: input.name,
      projectId: input.projectId,
      fileType: input.fileType,
      contentType: input.fileType === "directory" ? "text" : input.contentType,
      content: input.fileType === "directory" ? null : input.content,
      parentId: input.parentId,
    })
    .returning();

  return file;
};

// ─── createFolder ─────────────────────────────────────────────────────────────

/**
 * Creates a new **directory** inside a project.
 *
 * A type-safe, directory-specialised wrapper — the caller never passes
 * `fileType`, `contentType`, or `content`.
 *
 * Rules:
 *  - Caller must be authenticated.
 *  - Name validated against `createFolderSchema` (no path chars, max 255, etc.).
 *  - When `parentId` is given it must point to a non-deleted directory.
 *  - Name must be unique within the parent scope.
 *
 * @param rawInput  `{ name, projectId, parentId? }`
 * @returns         The newly inserted FileSelect row.
 */
export const createFolder = async (rawInput: CreateFolderInput) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  const input = createFolderSchema.parse(rawInput);

  await requireProjectAccess(input.projectId, currentUser.id);

  // Ensure parentId (if given) is actually a directory, not a plain file
  if (input.parentId) {
    const parentDir = await db.query.files.findFirst({
      where: and(
        eq(files.id, input.parentId),
        eq(files.projectId, input.projectId),
        eq(files.fileType, "directory"),
        eq(files.isDeleted, false),
      ),
      columns: { id: true },
    });
    if (!parentDir) {
      throw new Error("Parent not found, is deleted, or is not a directory.");
    }
  }

  await checkDuplicate(input.projectId, input.parentId, input.name);

  const [folder] = await db
    .insert(files)
    .values({
      name: input.name,
      projectId: input.projectId,
      fileType: "directory",
      contentType: "text",
      content: null,
      parentId: input.parentId,
    })
    .returning();

  return folder;
};

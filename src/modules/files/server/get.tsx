"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { files, projects } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/server/get-current-user";
import { buildFileTree } from "../shared/file-type-guards";

// ─── Shared project ownership helper ─────────────────────────────────────────

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

// ─── getFiles ─────────────────────────────────────────────────────────────────

/**
 * Returns every non-deleted file for a project as a **flat list**.
 *
 * Ideal for building a tree on the client or doing bulk operations.
 * Ordered by (parentId, name).
 *
 * @param projectId  UUID of the project.
 * @returns          Flat `FileSelect[]` ordered by parentId → name.
 */
export const getFiles = async (projectId: string) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  await requireProjectAccess(projectId, currentUser.id);

  return db.query.files.findMany({
    where: and(eq(files.projectId, projectId), eq(files.isDeleted, false)),
    orderBy: (f, { asc }) => [asc(f.parentId), asc(f.name)],
  });
};

// ─── getFolderContents ────────────────────────────────────────────────────────

/**
 * Returns the **full recursive tree** rooted at a folder (or at the project
 * root when `folderId` is omitted).
 *
 * A single DB query fetches every non-deleted project file; the nested tree
 * is assembled in-memory — no N+1 queries.
 *
 * Within every level: directories sort before files, each group alphabetically
 * and case-insensitively (VS Code style).
 *
 * @param projectId  UUID of the project.
 * @param folderId   UUID of the root directory, or `null` / `undefined` for
 *                   the project root.
 * @returns          Recursive `FileNode[]` tree.
 */
export const getFolderContents = async (
  projectId: string,
  folderId?: string | null,
) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  await requireProjectAccess(projectId, currentUser.id);

  // Verify the chosen root is a real, non-deleted directory (when provided)
  if (folderId) {
    const folder = await db.query.files.findFirst({
      where: and(
        eq(files.id, folderId),
        eq(files.projectId, projectId),
        eq(files.fileType, "directory"),
        eq(files.isDeleted, false),
      ),
      columns: { id: true },
    });
    if (!folder) throw new Error("Folder not found or is not a directory.");
  }

  const allFiles = await db.query.files.findMany({
    where: and(eq(files.projectId, projectId), eq(files.isDeleted, false)),
  });

  return buildFileTree(allFiles, folderId);
};

// ─── getFileById ──────────────────────────────────────────────────────────────

/**
 * Returns the full FileSelect row for a single file (including `content`).
 *
 * Used by the code editor to load a file's content without fetching the
 * entire project file list.
 *
 * @param fileId     UUID of the file.
 * @param projectId  UUID of the project (used for the ownership guard).
 * @returns          The FileSelect row, or null if not found.
 */
export const getFileById = async (fileId: string, projectId: string) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) throw new Error("Unauthorized");

  await requireProjectAccess(projectId, currentUser.id);

  const file = await db.query.files.findFirst({
    where: and(
      eq(files.id, fileId),
      eq(files.projectId, projectId),
      eq(files.isDeleted, false),
    ),
  });

  return file ?? null;
};

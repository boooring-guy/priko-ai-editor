"use server";

import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/server/get-current-user";

export interface RenameProjectInput {
  projectId: string;
  newName: string;
}

/**
 * Renames a project by ID.
 * - Validates the caller owns the project.
 * - Ensures no other project with the same name exists for this user.
 * - Returns the updated project row.
 */
export const renameProject = async ({
  projectId,
  newName,
}: RenameProjectInput) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const trimmedName = newName.trim();

  if (!trimmedName) {
    throw new Error("Project name cannot be empty");
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedName)) {
    throw new Error(
      "Project name can only contain letters, numbers, hyphens, and underscores",
    );
  }

  // Check the project belongs to the current user
  const existing = await db.query.projects.findFirst({
    where: and(
      eq(projects.id, projectId),
      eq(projects.ownerId, user.id),
      eq(projects.isDeleted, false),
    ),
  });

  if (!existing) {
    throw new Error("Project not found");
  }

  // Check for name conflict (another project with same name for same user)
  const conflict = await db.query.projects.findFirst({
    where: and(
      eq(projects.ownerId, user.id),
      eq(projects.name, trimmedName),
      ne(projects.id, projectId),
      eq(projects.isDeleted, false),
    ),
  });

  if (conflict) {
    throw new Error("A project with this name already exists");
  }

  const [updated] = await db
    .update(projects)
    .set({ name: trimmedName })
    .where(eq(projects.id, projectId))
    .returning();

  return updated;
};

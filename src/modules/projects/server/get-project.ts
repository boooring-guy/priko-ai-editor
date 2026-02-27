"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects, user } from "../../../db/schema";
import { getCurrentUser } from "../../auth/server/get-current-user";

export interface GetProjectArgs {
  username: string;
  projectname: string;
}

/**
 * Fetches a single project by owner username and project name.
 * Returns null if the project doesn't exist, is deleted, or belongs to a different user.
 * Throws if the caller is not authenticated.
 */
export const getProject = async ({ username, projectname }: GetProjectArgs) => {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error("Unauthorized");
  }

  // Resolve the owner's id by username so we can filter at the DB level,
  // preventing a name-collision from returning another user's project.
  const owner = await db.query.user.findFirst({
    where: eq(user.username, username),
    columns: { id: true },
  });

  if (!owner) {
    return null;
  }

  const project = await db.query.projects.findFirst({
    where: and(
      eq(projects.ownerId, owner.id),
      eq(projects.name, projectname),
      eq(projects.isDeleted, false),
    ),
    with: {
      owner: {
        columns: {
          username: true,
        },
      },
    },
  });

  return project ?? null;
};

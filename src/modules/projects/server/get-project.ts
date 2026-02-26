"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "../../../db/schema";
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

  const project = await db.query.projects.findFirst({
    where: and(eq(projects.name, projectname), eq(projects.isDeleted, false)),
    with: {
      owner: {
        columns: {
          username: true,
        },
      },
    },
  });

  // Ensure the project's owner matches the username in the URL
  if (!project || project.owner.username !== username) {
    return null;
  }

  return project;
};

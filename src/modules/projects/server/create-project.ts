"use server";

import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { getCurrentUser } from "@/modules/auth/server/get-current-user";
import { generateProjectTitle } from "../../../utils/project-title";

export interface CreateProjectInput {
  name?: string;
  description?: string;
}

export const createProject = async ({
  name,
  description,
}: CreateProjectInput) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  // Generate project title if not provided
  let finalname;
  if (!name) {
    finalname = generateProjectTitle();
  } else {
    finalname = name;
  }

  // check ownerID with project name is exists
  const existingProject = await db.query.projects.findFirst({
    where: and(eq(projects.ownerId, user.id), eq(projects.name, finalname)),
  });

  if (existingProject) {
    throw new Error("Project with this name already exists");
  }

  const [project] = await db
    .insert(projects)
    .values({
      name: finalname,
      description: description,
      ownerId: user.id,
    })
    .returning();

  return project;
};

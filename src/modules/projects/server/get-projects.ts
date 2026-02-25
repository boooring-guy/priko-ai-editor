"use server";

import { db } from "@/db";
import { getCurrentUser } from "../../auth/server/get-current-user";
import { projects } from "../../../db/schema";
import { and, desc, asc, eq, ilike, count } from "drizzle-orm";

export interface GetAllProjectsArgs {
  limit: number;
  offset: number;
  search?: string;
  orderBy?: string;
  orderDirection?: "asc" | "desc";
}

export const getAllProjects = async ({
  limit,
  offset,
  search,
  orderBy,
  orderDirection,
}: GetAllProjectsArgs) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const whereCondition = and(
    eq(projects.ownerId, user.id),
    eq(projects.isDeleted, false),
    search ? ilike(projects.name, `%${search}%`) : undefined,
  );

  const [totalResult] = await db
    .select({ count: count() })
    .from(projects)
    .where(whereCondition);

  let sortColumn: any = projects.createdAt;
  if (orderBy === "name") sortColumn = projects.name;
  if (orderBy === "importStatus") sortColumn = projects.importStatus;
  if (orderBy === "updatedAt") sortColumn = projects.updatedAt;

  const orderFn = orderDirection === "asc" ? asc : desc;

  const allProjects = await db
    .select()
    .from(projects)
    .where(whereCondition)
    .limit(limit)
    .offset(offset)
    .orderBy(orderFn(sortColumn));

  return {
    data: allProjects,
    total: totalResult.count,
  };
};

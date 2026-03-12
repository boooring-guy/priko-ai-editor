import { eq } from "drizzle-orm";
import { inngestClient } from "@/inngest/client";
import { INNGEST } from "@/inngest/keys";
import { db } from "@/db";
import { user, userConfig } from "@/db/schema";

export const newUserCreateConfig = inngestClient.createFunction(
  {
    id: INNGEST.NEW_USER.CREATE_CONFIG.FUNCTION,
  },
  {
    event: INNGEST.NEW_USER.CREATE_CONFIG.EVENT,
  },
  async ({ event, step }) => {
    const userId = event.data.userId as string;

    await step.run("create-default-config", async () => {
      // Verify user exists
      const existingUser = await db.query.user.findFirst({
        where: eq(user.id, userId),
      });

      if (!existingUser) {
        throw new Error(`User ${userId} not found`);
      }

      // Create default (empty) config — will fall back to config.json defaults
      await db
        .insert(userConfig)
        .values({
          userId,
          config: {},
        })
        .onConflictDoNothing();
    });

    return { success: true, userId };
  },
);

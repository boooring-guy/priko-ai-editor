import { z } from "zod";
import { fileInsertSchema } from "@/db/schema";
import { entryNameSchema } from "./create.schema";

// ─── Rename ────────────────────────────────────────────────────────────────────

export const renameSchema = z.object({
  /** ID of the file / folder to rename. */
  id: z.string().min(1),
  /** Project the entry belongs to — used for the ownership guard. */
  projectId: z.string().min(1),
  /** The desired new name — same validation rules as creation. */
  name: entryNameSchema,
});

export type RenameInput = z.infer<typeof renameSchema>;

// ─── Delete ────────────────────────────────────────────────────────────────────

export const deleteSchema = z.object({
  /** ID of the file / folder to (soft) delete. */
  id: z.string().min(1),
  /** Project the entry belongs to — used for the ownership guard. */
  projectId: fileInsertSchema.shape.projectId,
});

export type DeleteInput = z.infer<typeof deleteSchema>;

// ─── Update ────────────────────────────────────────────────────────────────────

export const updateFileSchema = z
  .object({
    /** ID of the file to update. */
    id: z.string().min(1),
    /** Project the entry belongs to — used for the ownership guard. */
    projectId: z.string().min(1),
    /** The new content — null clears the file. */
    content: z.string().nullable().optional(),
    /** The new content type (text/binary). */
    contentType: z.enum(["text", "binary"]).optional(),
  })
  .refine(
    (data) => data.content !== undefined || data.contentType !== undefined,
    {
      message: "At least one field (content or contentType) must be provided.",
    },
  );

export type UpdateFileInput = z.infer<typeof updateFileSchema>;

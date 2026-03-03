import { z } from "zod";
import { fileInsertSchema } from "@/db/schema";

// ─── Shared name validation ───────────────────────────────────────────────────

/**
 * Forbidden characters / sequences in any entry name — mirrors common
 * filesystem restrictions (Windows + Unix superset).
 *
 *  - Leading / trailing whitespace  → handled by .trim()
 *  - Only dots (`.` / `..`)         → reserved path segments
 *  - Forward or back slash          → path separator confusion
 *  - Null byte                      → breaks C-string APIs
 *  - Windows-reserved chars         → `< > : " | ? *`
 */
const INVALID_NAME_RE = /[/\\<>:"|?*\x00]/;

export const entryNameSchema = z
  .string()
  .trim()
  .min(1, "Name cannot be empty.")
  .max(255, "Name is too long (max 255 characters).")
  .refine((n) => n !== "." && n !== "..", {
    message: 'Name cannot be "." or "..".',
  })
  .refine((n) => !INVALID_NAME_RE.test(n), {
    message: 'Name contains an invalid character (/ \\ : * ? " < > | or null).',
  });

// ─── createFile ───────────────────────────────────────────────────────────────

// Derived from drizzle-zod — no hardcoded fields.
// Kept in a shared (non-server) module so it can be imported by both
// client components (for form validation) and server actions.
export const createFileSchema = fileInsertSchema
  .pick({
    name: true,
    projectId: true,
    fileType: true,
    contentType: true,
    content: true,
    parentId: true,
  })
  .extend({
    name: entryNameSchema,
    contentType: fileInsertSchema.shape.contentType.default("text"),
    content: fileInsertSchema.shape.content.default(null),
    parentId: fileInsertSchema.shape.parentId.default(null),
  });

export type CreateFileInput = z.infer<typeof createFileSchema>;

// ─── createFolder ─────────────────────────────────────────────────────────────

export const createFolderSchema = fileInsertSchema
  .pick({ projectId: true, parentId: true })
  .extend({
    name: entryNameSchema,
    // parentId is optional — omitting it means "create at project root"
    parentId: fileInsertSchema.shape.parentId.default(null),
  });

export type CreateFolderInput = z.infer<typeof createFolderSchema>;

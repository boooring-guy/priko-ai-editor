import type { FileSelect } from "@/db/schema";

/**
 * A file or directory node in the recursive tree.
 * `children` is always present:
 *   - for a file   → always an empty array
 *   - for a directory → its nested FileNode children
 */
export type FileNode = FileSelect & {
  children: FileNode[];
};

/** Narrows a FileNode to one that is a directory. */
export const isDirectory = (
  f: FileNode,
): f is FileNode & { fileType: "directory" } => f.fileType === "directory";

/** Narrows a FileNode to one that is a plain file. */
export const isFile = (f: FileNode): f is FileNode & { fileType: "file" } =>
  f.fileType === "file";

/**
 * Builds a recursive tree from a flat list of FileSelect rows.
 *
 * @param allFiles  Every non-deleted file for a project (flat).
 * @param rootId    ID of the folder to use as the tree root,
 *                  or `null` / `undefined` for the project root.
 * @returns         Direct children of `rootId` with their subtrees attached.
 */
export function buildFileTree(
  allFiles: FileSelect[],
  rootId?: string | null,
): FileNode[] {
  // Index all files by their parentId for O(1) child lookups
  const byParent = new Map<string | null, FileSelect[]>();

  for (const f of allFiles) {
    const key = f.parentId ?? null;
    const bucket = byParent.get(key) ?? [];
    bucket.push(f);
    byParent.set(key, bucket);
  }

  function buildNodes(parentId: string | null): FileNode[] {
    const children = byParent.get(parentId) ?? [];

    // VS Code style: directories first, then files — each group sorted
    // case-insensitively and alphabetically (e.g. "Zebra" before "apple" won't happen)
    return children
      .sort((a, b) => {
        if (a.fileType !== b.fileType) {
          return a.fileType === "directory" ? -1 : 1;
        }
        return a.name.localeCompare(b.name, undefined, { sensitivity: "base" });
      })
      .map((f) => ({
        ...f,
        children: f.fileType === "directory" ? buildNodes(f.id) : [],
      }));
  }

  return buildNodes(rootId ?? null);
}

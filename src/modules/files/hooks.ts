import { useMutation, useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { queryClient } from "@/components/providers";
import { getFiles } from "./server/get";
import { getFileById } from "./server/get";
import { createFile, createFolder } from "./server/create";
import { deleteFile, deleteFolder } from "./server/delete";
import { renameFile, renameFolder } from "./server/rename";
import { updateFile } from "./server/update";
import type {
  CreateFileInput,
  CreateFolderInput,
} from "./shared/create.schema";
import type {
  RenameInput,
  DeleteInput,
  UpdateFileInput,
} from "./shared/mutations.schema";

// ─── Shared invalidation helper ───────────────────────────────────────────────

function invalidateFiles() {
  queryClient.invalidateQueries({ queryKey: queryKeys.files.all });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetches the flat list of all non-deleted files for a project, then surfaces
 * it for the explorer to build a tree from via `buildFileTree`.
 */
export function useGetFiles(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.files.list({ projectId }),
    queryFn: () => getFiles(projectId!),
    enabled: !!projectId,
  });
}

export function useGetFileContent(
  fileId: string | null | undefined,
  projectId: string | null | undefined,
) {
  return useQuery({
    queryKey: queryKeys.files.detail(fileId ?? ""),
    queryFn: () => getFileById(fileId!, projectId!),
    enabled: !!fileId && !!projectId,
    staleTime: 30_000, // 30 s — avoids re-fetching on every re-render
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateFile() {
  return useMutation({
    mutationFn: (input: CreateFileInput) => createFile(input),
    onSuccess: invalidateFiles,
  });
}

export function useCreateFolder() {
  return useMutation({
    mutationFn: (input: CreateFolderInput) => createFolder(input),
    onSuccess: invalidateFiles,
  });
}

export function useDeleteFile() {
  return useMutation({
    mutationFn: (input: DeleteInput) => deleteFile(input),
    onSuccess: invalidateFiles,
  });
}

export function useDeleteFolder() {
  return useMutation({
    mutationFn: (input: DeleteInput) => deleteFolder(input),
    onSuccess: invalidateFiles,
  });
}

export function useRenameFile() {
  return useMutation({
    mutationFn: (input: RenameInput) => renameFile(input),
    onSuccess: invalidateFiles,
  });
}

export function useRenameFolder() {
  return useMutation({
    mutationFn: (input: RenameInput) => renameFolder(input),
    onSuccess: invalidateFiles,
  });
}

export function useUpdateFile() {
  return useMutation({
    mutationFn: (input: UpdateFileInput) => updateFile(input),
    onSuccess: invalidateFiles,
  });
}

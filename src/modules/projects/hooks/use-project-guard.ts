"use client";

import { useGetProject } from "../hooks";

/**
 * Returns loading state, the resolved project, and a notFound flag.
 * The caller is responsible for rendering a 404 UI when notFound is true.
 */
export function useProjectGuard(username: string, projectname: string) {
  const {
    data: project,
    isPending,
    isError,
  } = useGetProject(username, projectname);

  const notFound = !isPending && (isError || project === null);

  return {
    isLoading: isPending,
    project: project ?? null,
    notFound,
  };
}

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { queryClient } from "../../components/providers";
import { createProject } from "./server/create-project";
import { getProject } from "./server/get-project";
import { getAllProjects } from "./server/get-projects";

// Mutations
export function useCreateProject() {
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    },
    onError: (error) => {
      console.error("Failed to create project:", error);
    },
    // onMutate: async () => {
    //   await queryClient.cancelQueries({ queryKey: queryKeys.projects.lists() });
    //   const previousProjects = queryClient.getQueryData(
    //     queryKeys.projects.lists(),
    //   );
    //   return { previousProjects };
    // },
    // onSettled: () => {
    //   queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() });
    // },
  });
}

// Queries
import type { GetAllProjectsArgs } from "./server/get-projects";

export function useGetAllProjects(params: GetAllProjectsArgs) {
  return useQuery({
    queryKey: queryKeys.projects.list(params as any),
    queryFn: () => getAllProjects(params),
    placeholderData: keepPreviousData,
  });
}

export function useGetInfiniteProjects(
  params: Omit<GetAllProjectsArgs, "offset">,
) {
  return useInfiniteQuery({
    queryKey: queryKeys.projects.list({ ...params, type: "infinite" } as any),
    queryFn: ({ pageParam = 0 }) =>
      getAllProjects({ ...params, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const nextOffset = allPages.length * params.limit;
      if (nextOffset < lastPage.total) {
        return nextOffset;
      }
      return undefined;
    },
  });
}

export function useGetProject(username: string, projectname: string) {
  return useQuery({
    queryKey: queryKeys.projects.scoped("detail", { username, projectname }),
    queryFn: () => getProject({ username, projectname }),
    enabled: !!username && !!projectname,
    // Don't retry on 404-like nulls — treat them as definitive
    retry: false,
  });
}

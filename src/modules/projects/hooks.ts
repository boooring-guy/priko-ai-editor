import {
  useMutation,
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { createProject } from "./server/create-project";
import { queryKeys } from "@/lib/query-keys";
import { queryClient } from "../../components/providers";
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

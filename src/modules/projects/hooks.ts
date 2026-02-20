import { useMutation } from "@tanstack/react-query";
import { createProject } from "./server/create-project";
import { queryKeys } from "@/lib/query-keys";
import { queryClient } from "../../components/providers";

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

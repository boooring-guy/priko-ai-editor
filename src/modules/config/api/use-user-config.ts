import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getUserConfig,
  updateUserConfig,
} from "@/modules/config/server/config-actions";
import type { PartialAppConfig } from "../types";

const CONFIG_QUERY_KEY = ["user-config"] as const;

/**
 * Fetches the current user's config overrides from the DB.
 */
export function useUserConfig() {
  return useQuery({
    queryKey: CONFIG_QUERY_KEY,
    queryFn: () => getUserConfig(),
  });
}

/**
 * Mutation to upsert the user's config overrides.
 * Optimistically updates the cache and rolls back on error.
 */
export function useUpdateUserConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (partial: PartialAppConfig) => updateUserConfig(partial),
    onMutate: async (partial) => {
      await queryClient.cancelQueries({ queryKey: CONFIG_QUERY_KEY });
      const previous = queryClient.getQueryData<PartialAppConfig | null>(
        CONFIG_QUERY_KEY,
      );
      queryClient.setQueryData<PartialAppConfig | null>(
        CONFIG_QUERY_KEY,
        (old) => deepMergePartial(old ?? {}, partial),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous !== undefined) {
        queryClient.setQueryData(CONFIG_QUERY_KEY, context.previous);
      }
      toast.error("Failed to save settings");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_QUERY_KEY });
    },
  });
}

function deepMergePartial(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const output = { ...target };
  for (const key of Object.keys(source)) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      srcVal &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      output[key] = deepMergePartial(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>,
      );
    } else {
      output[key] = srcVal;
    }
  }
  return output;
}

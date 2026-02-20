/**
 * A robust query key factory to ensure consistent and typo-free query keys
 * across the entire application.
 *
 * Inspired by TkDodo's Effective React Query Keys:
 * https://tkdodo.eu/blog/effective-react-query-keys
 */

export function createQueryKeyFactory<TBase extends string>(baseKey: TBase) {
  return {
    /**
     * The root key for the entity. Useful for invalidating all queries related to this entity.
     * @example ['users']
     */
    all: [baseKey] as const,

    /**
     * Key for lists of the entity.
     * @example ['users', 'list']
     */
    lists: () => [...[baseKey], "list"] as const,

    /**
     * Key for a specific filtered list of the entity.
     * @param filters - An object containing filter parameters.
     * @example ['users', 'list', { role: 'admin' }]
     */
    list: <TFilters extends Record<string, unknown>>(filters?: TFilters) =>
      filters
        ? ([...[baseKey], "list", filters] as const)
        : ([...[baseKey], "list"] as const),

    /**
     * Key for details/single items of the entity.
     * @example ['users', 'detail']
     */
    details: () => [...[baseKey], "detail"] as const,

    /**
     * Key for a specific single item of the entity.
     * @param id - The unique identifier of the item.
     * @example ['users', 'detail', '1']
     */
    detail: <TId extends string | number>(id: TId) =>
      [...[baseKey], "detail", String(id)] as const,

    /**
     * Custom scope for query keys that don't fit into the standard list/detail pattern.
     * @param scope - A string describing the custom scope.
     * @example ['users', 'stats']
     */
    scope: <TScope extends string>(scope: TScope) =>
      [...[baseKey], scope] as const,

    /**
     * Custom scope with parameters.
     * @param scope - A string describing the custom scope.
     * @param params - Parameters for the custom scope.
     * @example ['users', 'stats', { year: 2024 }]
     */
    scoped: <
      TScope extends string,
      TParams extends Record<string, unknown> | string | number | boolean,
    >(
      scope: TScope,
      params: TParams,
    ) => [...[baseKey], scope, params] as const,
  };
}

// ============================================================================
// Add specific feature query keys here using the factory!
// ============================================================================

export const queryKeys = {
  // Example: users keys
  // users: createQueryKeyFactory("users"),

  // Example: posts keys
  // posts: createQueryKeyFactory("posts"),

  // Auth keys (since better-auth is used in the project)
  auth: createQueryKeyFactory("auth"),
};

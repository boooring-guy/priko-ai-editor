"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "./use-current-user";

/**
 * Redirects the user to /sign-in if they are not authenticated.
 * Returns loading + authentication state so the caller can gate rendering.
 */
export function useUserGuard() {
  const router = useRouter();
  const { data: session, isPending } = useCurrentUser();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in");
    }
  }, [isPending, session, router]);

  return {
    isLoading: isPending,
    isAuthenticated: !!session,
  };
}

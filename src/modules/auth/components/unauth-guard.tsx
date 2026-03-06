"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { useCurrentUser } from "../api/use-current-user";

interface UnauthGuardProps {
  children: React.ReactNode;
}

export const UnauthGuard = ({ children }: UnauthGuardProps) => {
  const router = useRouter();
  const { data: session, isPending } = useCurrentUser();
  const hasInitiallyLoaded = useRef(false);

  // Track whether the initial session check has completed
  if (!isPending && !hasInitiallyLoaded.current) {
    hasInitiallyLoaded.current = true;
  }

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/");
    }
  }, [isPending, session, router]);

  // Only show loading state on the very first load,
  // not on background refetches (e.g. window focus)
  if (!hasInitiallyLoaded.current && isPending) {
    return null;
  }

  if (session) {
    return null;
  }

  return <>{children}</>;
};

"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "../api/use-current-user";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const router = useRouter();
  const { data: session, isPending } = useCurrentUser();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/sign-in"); // Using replace instead of push to avoid history stack issues
    }
  }, [isPending, session, router]);

  // Show nothing (or could be a full page loader) while checking status
  if (isPending) {
    return null;
  }

  // If not logged in, we return null because useEffect will redirect
  if (!session) {
    return null;
  }

  return <>{children}</>;
};

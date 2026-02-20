"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCurrentUser } from "../api/use-current-user";

interface UnauthGuardProps {
  children: React.ReactNode;
}

export const UnauthGuard = ({ children }: UnauthGuardProps) => {
  const router = useRouter();
  const { data: session, isPending } = useCurrentUser();

  useEffect(() => {
    if (!isPending && session) {
      router.replace("/");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return null;
  }

  if (session) {
    return null;
  }

  return <>{children}</>;
};

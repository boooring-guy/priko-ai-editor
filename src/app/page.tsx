"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Header } from "@/components/layout/header";
import { useCurrentUser } from "@/modules/auth/api/use-current-user";
import { ProjectsView } from "@/modules/projects/components/projects-view";
import { version } from "../../package.json";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useCurrentUser();

  React.useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="p-8 flex-1">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-title-lg font-bold tracking-tight">
              Welcome, {session.user.name.split(" ")[0]}!
            </h1>
            <p className="text-body text-muted-foreground mt-2">
              This is your simple test paragraph. Below is some application
              info.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <ProjectsView />
          </div>
        </div>
      </main>
    </div>
  );
}

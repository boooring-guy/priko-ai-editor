"use client";

import { ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import config from "@/config.json";
import { useCurrentUser } from "@/modules/auth/api/use-current-user";
import { ProjectsDataTable } from "@/modules/projects/components/projects-data-table";

export default function AllProjectsPage() {
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
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="p-8 flex-1">
        <div className="max-w-7xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Projects Directory
            </h1>
            <p className="text-muted-foreground mt-2">
              Viewing all projects in the workspace.
            </p>
          </div>

          <div className="flex flex-col gap-4 bg-background border rounded-lg p-6 shadow-sm">
            <ProjectsDataTable
              defaultLimit={config.app.projects.query.defaults.allProjectsLimit}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

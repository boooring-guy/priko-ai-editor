"use client";

import { version } from "../../../package.json";
import { Loader2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useCurrentUser } from "@/modules/auth/api/use-current-user";
import { UserButton } from "@/modules/auth/components/user-button";
import { ProjectsDataTable } from "@/modules/projects/components/projects-data-table";
import { Button } from "@/components/ui/button";
import config from "@/config.json";

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
      <header className="flex justify-between items-center border-b p-4 px-8 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-xl font-bold tracking-tight">All Projects</h1>
          <span className="text-xs text-muted-foreground">v{version}</span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <UserButton />
        </div>
      </header>

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

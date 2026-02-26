"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { GoDesktopDownload, GoPlus, GoRepo, GoSync } from "react-icons/go";
import { toast } from "sonner";
import { queryClient } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@/components/ui/button-group";
import { CommandShortcut } from "@/components/ui/command";
import { queryKeys } from "@/lib/query-keys";
import { CreateProjectModal } from "./create-project-modal";
import { ProjectsDataTable } from "./projects-data-table";

export const ProjectsView = () => {
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "i" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toast.info("Import project triggered");
      }
      if (e.key === "l" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push("/all-projects");
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [router]);

  return (
    <div className="flex flex-col md:flex-row items-start mt-6 h-[calc(100vh-8rem)]">
      {/* Left Column: Sidebar with Quick Actions and Recent Project */}
      <aside className="w-full md:w-64 shrink-0 flex flex-col gap-6 pr-6 md:h-full md:sticky md:top-6">
        <div className="flex flex-col gap-4">
          <h2 className="text-label text-muted-foreground uppercase px-1">
            Start
          </h2>
          <ButtonGroup
            orientation="vertical"
            className="flex-col !w-full shadow-sm [&_button]:w-full"
          >
            <CreateProjectModal>
              <Button
                variant="default"
                className="w-full justify-between gap-3 h-12 rounded-b-none"
              >
                <div className="flex items-center gap-2">
                  <GoPlus className="size-4" />
                  New Project
                </div>
                <CommandShortcut className="text-primary-foreground/70">
                  ⌘J
                </CommandShortcut>
              </Button>
            </CreateProjectModal>
            <ButtonGroupSeparator orientation="horizontal" />
            <Button
              variant="secondary"
              className="w-full justify-between gap-3 h-12 rounded-t-none border-t-0"
              onClick={() => toast.info("Import project triggered")}
            >
              <div className="flex items-center gap-2">
                <GoDesktopDownload className="size-4" />
                Import Project
              </div>
              <CommandShortcut>⌘I</CommandShortcut>
            </Button>
          </ButtonGroup>
        </div>

        <RecentProjectSection />
      </aside>

      {/* Right Column: Projects Data Table */}
      <div className="flex-1 w-full flex flex-col gap-4 pl-0 md:pl-6 h-full overflow-hidden">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-label text-muted-foreground uppercase px-1">
            Projects
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={() => {
                toast.promise(
                  queryClient.invalidateQueries({
                    queryKey: queryKeys.projects.lists(),
                  }),
                  {
                    loading: "Refreshing projects...",
                    success: "Projects refreshed",
                    error: "Failed to refresh",
                  },
                );
              }}
            >
              <GoSync className="size-4" />
              <span className="sr-only">Refresh projects</span>
            </Button>
            <Button variant="secondary" size="sm" asChild className="h-8 gap-1">
              <Link href="/projects">
                View All
                <CommandShortcut className="ml-1 tracking-widest text-muted-foreground">
                  ⌘L
                </CommandShortcut>
              </Link>
            </Button>
          </div>
        </div>

        <ProjectsDataTable />
      </div>
    </div>
  );
};

import { useAtomValue } from "jotai";
import { activeProjectAtom } from "../store/project-atoms";

const RecentProjectSection = () => {
  const activeProject = useAtomValue(activeProjectAtom);

  return (
    <div className="flex flex-col gap-3  max-sm:mb-10">
      <h2 className="text-label text-muted-foreground uppercase px-1">
        Recent Project
      </h2>

      {activeProject ? (
        <Link
          href={`/projects/${activeProject.username}/${activeProject.projectname}`}
          className="group flex flex-col gap-1 p-3 rounded-md border bg-card hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground transition-colors">
              <GoRepo className="size-3.5" />
            </div>
            <span className="text-label truncate">{activeProject.name}</span>
          </div>
          <span className="text-caption text-muted-foreground pl-8 truncate">
            {formatDistanceToNow(new Date(activeProject.updatedAt), {
              addSuffix: true,
            })}
          </span>
        </Link>
      ) : (
        <div className="text-body-sm text-muted-foreground px-1 py-2 italic">
          No recent project.
        </div>
      )}
    </div>
  );
};

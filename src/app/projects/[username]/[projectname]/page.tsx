"use client";

import { useSetAtom } from "jotai";
import { Suspense, use, useEffect } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";
import { useUserGuard } from "@/modules/auth/api/use-user-guard";
import { ProjectNotFound } from "@/modules/projects/components/project-not-found";
import { ProjectsTableError } from "@/modules/projects/components/projects-table-error";
import { useProjectGuard } from "@/modules/projects/hooks/use-project-guard";
import { activeProjectAtom } from "@/modules/projects/store/project-atoms";

type ProjectPageProps = {
  params: Promise<{
    username: string;
    projectname: string;
  }>;
};

// Inner component: safely uses `use()` to unwrap params in a Client Component
function ProjectPageContent({ params }: ProjectPageProps) {
  const { username, projectname } = use(params);

  // ── Guards ──────────────────────────────────────────────────────────────────
  const { isLoading: userLoading, isAuthenticated } = useUserGuard();
  const {
    isLoading: projectLoading,
    project,
    notFound,
  } = useProjectGuard(username, projectname);

  // ── Sync active project atom with real data ─────────────────────────────────
  const setActiveProject = useSetAtom(activeProjectAtom);
  useEffect(() => {
    if (project) {
      setActiveProject({
        id: project.id,
        name: project.name,
        username: project.owner.username ?? username,
        projectname: project.name,
        updatedAt: project.updatedAt.toISOString(),
      });
    }
  }, [project, username, setActiveProject]);

  // Show skeleton while either guard is resolving
  if (userLoading || projectLoading) {
    return <ProjectPageSkeleton />;
  }

  // useUserGuard handles the redirect to /sign-in via useEffect
  if (!isAuthenticated) {
    return null;
  }

  // Show custom 404 when project doesn't exist or is deleted
  if (notFound) {
    return <ProjectNotFound />;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{project?.name}</h1>
      <p className="text-muted-foreground">by {project?.owner.username}</p>
    </div>
  );
}

// Skeleton for Suspense fallback while params are being resolved
function ProjectPageSkeleton() {
  return (
    <div className="p-8 flex flex-col gap-4">
      <div className="h-8 w-48 rounded-md bg-muted animate-pulse" />
      <div className="h-4 w-32 rounded-md bg-muted animate-pulse" />
    </div>
  );
}

// Error fallback for ErrorBoundary — error is `unknown` per react-error-boundary's FallbackProps
function ProjectPageError({ error, resetErrorBoundary }: FallbackProps) {
  const err = error instanceof Error ? error : new Error(String(error));
  return (
    <div className="p-8">
      <ProjectsTableError error={err} resetErrorBoundary={resetErrorBoundary} />
    </div>
  );
}

// Root page: NOT async — wraps content with Suspense + ErrorBoundary
export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <Suspense fallback={<ProjectPageSkeleton />}>
      <ErrorBoundary FallbackComponent={ProjectPageError}>
        <ProjectPageContent params={params} />
      </ErrorBoundary>
    </Suspense>
  );
}

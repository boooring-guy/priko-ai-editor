import { Header } from "@/components/layout/header";
import { ProjectWorkspace } from "@/modules/projects/components/project-workspace";
import { ProjectHeaderExtension } from "@/modules/projects/components/project-header-extension";
import type React from "react";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string; projectname: string }>;
}) {
  const { username, projectname } = await params;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Header
        breadcrumbItems={[
          { title: "Home", href: "/" },
          { title: "Projects", href: "/projects" },
          { title: username, href: `/projects/${username}` },
          { title: projectname, href: `/projects/${username}/${projectname}` },
        ]}
        centerContent={<ProjectHeaderExtension />}
      />
      <div className="flex-1 overflow-hidden">
        <ProjectWorkspace />
      </div>
    </div>
  );
}

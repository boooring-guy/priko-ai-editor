"use client";

import {
  ChevronRight,
  FileCode2,
  FileText,
  Folder,
  Home,
  Menu,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbSegment {
  title: string;
  href: string;
  isLast: boolean;
  icon?: React.ReactNode;
}

interface AdaptiveBreadcrumbsProps {
  // Optional custom items to override automatic path-based generation
  items?: Omit<BreadcrumbSegment, "isLast">[];
  className?: string;
}

export function AdaptiveBreadcrumbs({
  items,
  className,
}: AdaptiveBreadcrumbsProps) {
  const pathname = usePathname();

  // Helper to determine icon based on segment name or extension
  const getIconForSegment = (segment: string) => {
    const lowerSegment = segment.toLowerCase();
    if (lowerSegment.endsWith(".ts") || lowerSegment.endsWith(".tsx")) {
      // Future-proof: You can replace this with an actual TS logo SVG component later
      return <FileCode2 className="h-4 w-4 text-blue-500" />;
    }
    if (lowerSegment.includes("document") || lowerSegment.endsWith(".md")) {
      return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
    // Default to folder for intermediate paths if not specified
    return <Folder className="h-4 w-4 text-muted-foreground" />;
  };

  const generateSegments = (): BreadcrumbSegment[] => {
    if (items) {
      return items.map((item, index) => {
        let icon = item.icon;
        if (!icon) {
          icon =
            item.title === "Home" ? (
              <Home className="h-4 w-4" />
            ) : (
              getIconForSegment(item.title)
            );
        }
        return {
          ...item,
          icon,
          isLast: index === items.length - 1,
        };
      });
    }

    const paths = pathname.split("/").filter((path) => path);
    const result: BreadcrumbSegment[] = [];

    // Always ensure Home is first (if not overriding items)
    result.push({
      title: "Home",
      href: "/",
      isLast: paths.length === 0,
      icon: <Home className="h-4 w-4" />,
    });

    let currentPath = "";
    paths.forEach((path, index) => {
      currentPath += `/${path}`;
      // Capitalize first letter and replace hyphens
      const title =
        path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");

      result.push({
        title,
        href: currentPath,
        isLast: index === paths.length - 1,
        icon: getIconForSegment(path),
      });
    });

    return result;
  };

  const segments = generateSegments();

  return (
    <>
      <div
        className={cn(
          "hidden md:inline-flex items-center px-3 py-1.5 rounded-full border bg-background shadow-sm",
          className,
        )}
      >
        <Breadcrumb>
          <BreadcrumbList className="gap-1 sm:gap-1">
            {segments.map((segment, _index) => {
              return (
                <React.Fragment key={segment.href}>
                  <BreadcrumbItem>
                    {segment.isLast ? (
                      <BreadcrumbPage className="flex items-center gap-1.5 font-medium">
                        {segment.icon && segment.icon}
                        {segment.title !== "Home" && (
                          <span>{segment.title}</span>
                        )}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink
                        asChild
                        className="flex items-center gap-1.5 hover:text-foreground text-muted-foreground"
                      >
                        <Link href={segment.href}>
                          {segment.icon && segment.icon}
                          {segment.title !== "Home" && (
                            <span>{segment.title}</span>
                          )}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!segment.isLast && (
                    <BreadcrumbSeparator className="[&>svg]:size-3.5 mx-0.5 text-muted-foreground/50">
                      <ChevronRight />
                    </BreadcrumbSeparator>
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className={cn("md:hidden", className)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Folder className="h-4 w-4" />
              <span className="sr-only">Open breadcrumbs</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {segments.map((segment, index) => (
              <DropdownMenuItem key={segment.href} asChild>
                <Link
                  href={segment.href}
                  className="flex items-center gap-2 cursor-pointer relative"
                  style={{ paddingLeft: `${(index + 1) * 0.75}rem` }}
                >
                  {/* Decorative guide lines for tree structure */}
                  {index > 0 && (
                    <div
                      className="absolute border-l border-b border-muted-foreground/30 rounded-bl-sm"
                      style={{
                        left: `${index * 0.75}rem`,
                        top: "0",
                        height: "50%",
                        width: "0.5rem",
                      }}
                    />
                  )}
                  {segment.icon && segment.icon}
                  <span>{segment.title}</span>
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

"use client";

/**
 * Breadcrumbs Component
 * Navigation breadcrumbs for PM pages
 */

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { usePathname } from "next/navigation";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  projectName?: string;
  projectId?: string;
}

export function Breadcrumbs({ items, projectName, projectId }: BreadcrumbsProps) {
  const pathname = usePathname();

  // Auto-generate breadcrumbs if not provided
  const breadcrumbItems: BreadcrumbItem[] = items || [];

  if (!items && pathname) {
    breadcrumbItems.push({
      label: "Projects",
      href: "/project-management",
    });

    if (projectName && projectId) {
      breadcrumbItems.push({
        label: projectName,
        href: `/project-management/${projectId}/board`,
      });

      // Add current page
      if (pathname.includes("/board")) {
        breadcrumbItems.push({ label: "Board" });
      } else if (pathname.includes("/backlog")) {
        breadcrumbItems.push({ label: "Backlog" });
      } else if (pathname.includes("/sprints")) {
        breadcrumbItems.push({ label: "Sprints" });
      } else if (pathname.includes("/metrics")) {
        breadcrumbItems.push({ label: "Metrics" });
      } else if (pathname.includes("/settings")) {
        breadcrumbItems.push({ label: "Settings" });
      }
    }
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center text-sm text-gray-600 dark:text-gray-400"
    >
      <Link
        href="/dashboard"
        className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;

        return (
          <div key={index} className="flex items-center">
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={
                  isLast
                    ? "text-gray-900 dark:text-gray-100 font-medium"
                    : ""
                }
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
}

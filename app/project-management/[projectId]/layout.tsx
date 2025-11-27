"use client";

/**
 * Project Management Layout
 * Nested layout with tab navigation for all PM pages under a project
 */

import { use, useState, Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useProject } from "@/hooks/projects";
import { useCreateTask, useUsers } from "@/hooks/pm";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Breadcrumbs } from "@/components/pm/shared/breadcrumbs";
import { ErrorBoundary } from "@/components/pm/shared/error-boundary";
import { KeyboardShortcutsProvider } from "@/components/pm/shared/keyboard-shortcuts";
import { BoardSkeleton } from "@/components/pm/shared/loading-skeleton";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/pm/task/task-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  LayoutList,
  Kanban,
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PMLayoutProps {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}

export default function PMLayout({ children, params }: PMLayoutProps) {
  const { projectId } = use(params);
  const { project, isLoading } = useProject(projectId);
  const pathname = usePathname();
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const { toast } = useToast();
  const { trigger: createTask } = useCreateTask();

  // Get current authenticated user from Clerk
  const { userId } = useAuth();

  // Fetch users for assignment
  const { users } = useUsers();

  const tabs = [
    {
      label: "Backlog",
      icon: LayoutList,
      href: `/project-management/${projectId}/backlog`,
      value: "backlog",
    },
    {
      label: "Board",
      icon: Kanban,
      href: `/project-management/${projectId}/board`,
      value: "board",
    },
    {
      label: "Sprints",
      icon: Calendar,
      href: `/project-management/${projectId}/sprints`,
      value: "sprints",
    },
    {
      label: "Metrics",
      icon: BarChart3,
      href: `/project-management/${projectId}/metrics`,
      value: "metrics",
    },
    {
      label: "Settings",
      icon: Settings,
      href: `/project-management/${projectId}/settings`,
      value: "settings",
    },
  ];

  // Determine active tab
  const activeTab =
    tabs.find((tab) => pathname?.includes(tab.value))?.value || "board";

  // Handle new task action from keyboard shortcut
  const handleNewTask = () => {
    setShowNewTaskDialog(true);
  };

  // Handle search focus from keyboard shortcut
  const handleSearchFocus = () => {
    setSearchFocused(true);
    // Focus search input if it exists
    const searchInput =
      document.querySelector<HTMLInputElement>(".search-input");
    searchInput?.focus();
  };

  // Handle create task submission
  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data);
      toast({
        title: "Task created",
        description: "Your task has been created successfully.",
      });
      setShowNewTaskDialog(false);
    } catch (error) {
      console.error("[PM] Create task error:", error);
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <KeyboardShortcutsProvider
      projectId={projectId}
      onNewTask={handleNewTask}
      onSearch={handleSearchFocus}
    >
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header with Breadcrumbs and Project Info */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="px-6 py-4 space-y-3">
            {/* Breadcrumbs */}
            <Breadcrumbs projectName={project?.name} projectId={projectId} />

            {/* Project Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {isLoading ? "Loading..." : project?.name || "Project"}
                </h1>
                {project?.company && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {project.company}
                  </p>
                )}
              </div>

              {/* Quick Action Button */}
              <Button onClick={handleNewTask} className="gap-2" size="default">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Task</span>
              </Button>
            </div>
          </div>

          {/* Tab Navigation - Desktop */}
          <div className="hidden md:block px-6">
            <Tabs value={activeTab} className="w-full">
              <TabsList className="w-full justify-start h-12 bg-transparent border-b-0 p-0 rounded-none">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;

                  return (
                    <Link
                      key={tab.value}
                      href={tab.href}
                      className="flex-shrink-0"
                    >
                      <TabsTrigger
                        value={tab.value}
                        className={cn(
                          "h-12 rounded-none border-b-2 border-transparent px-4 gap-2",
                          "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:border-b-transparent rounded-t-lg",
                          "hover:bg-gray-50 dark:hover:bg-gray-900"
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </TabsTrigger>
                    </Link>
                  );
                })}
              </TabsList>
            </Tabs>
          </div>

          {/* Tab Navigation - Mobile (Dropdown) */}
          <div className="md:hidden px-6 pb-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                  <span className="flex items-center gap-2">
                    {tabs.find((t) => t.value === activeTab)?.icon &&
                      (() => {
                        const Icon = tabs.find(
                          (t) => t.value === activeTab
                        )!.icon;
                        return <Icon className="w-4 h-4" />;
                      })()}
                    {tabs.find((t) => t.value === activeTab)?.label}
                  </span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <Link key={tab.value} href={tab.href}>
                      <DropdownMenuItem className="gap-2">
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </DropdownMenuItem>
                    </Link>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content with Error Boundary */}
        <div className="flex-1 overflow-auto">
          <ErrorBoundary>
            <Suspense fallback={<BoardSkeleton />}>{children}</Suspense>
          </ErrorBoundary>
        </div>

        {/* Global Task Dialog */}
        <TaskDialog
          open={showNewTaskDialog}
          onOpenChange={setShowNewTaskDialog}
          onSubmit={handleCreateTask}
          projectId={projectId}
          currentUserId={userId || ""}
          users={users}
          mode="create"
        />
      </div>
    </KeyboardShortcutsProvider>
  );
}

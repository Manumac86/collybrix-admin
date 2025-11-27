"use client";

/**
 * Project Management Landing Page
 * Shows all projects with quick access to their PM boards
 */

import { useState, useMemo } from "react";
import Link from "next/link";
import { useProjects } from "@/hooks/projects";
import { useTasks, useSprints } from "@/hooks/pm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/pm/shared/loading-skeleton";
import { EmptyState } from "@/components/pm/shared/empty-state";
import {
  Search,
  Kanban,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

/**
 * Project Card Component
 * Displays project info with task counts and sprint status
 */
function ProjectCard({ project }: { project: any }) {
  const projectId = project._id;

  // Fetch tasks for this project
  const { tasks, isLoading: tasksLoading } = useTasks(projectId, { projectId });

  // Fetch active sprint
  const { sprints, isLoading: sprintsLoading } = useSprints(
    projectId,
    "active"
  );
  const activeSprint = sprints[0] || null;

  // Calculate task counts by status
  const taskCounts = useMemo(() => {
    const counts = {
      total: tasks.length,
      todo: 0,
      inProgress: 0,
      done: 0,
      blocked: 0,
    };

    tasks.forEach((task) => {
      if (task.status === "todo") counts.todo++;
      else if (task.status === "in_progress") counts.inProgress++;
      else if (task.status === "done") counts.done++;
      else if (task.status === "blocked") counts.blocked++;
    });

    return counts;
  }, [tasks]);

  // Get recent activity indicator (last updated task)
  const lastActivity = useMemo(() => {
    if (tasks.length === 0) return null;

    const sortedTasks = [...tasks].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    return sortedTasks[0]?.updatedAt;
  }, [tasks]);

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{project.name}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {project.company}
            </CardDescription>
          </div>
          <Badge
            variant={project.status === "active" ? "default" : "secondary"}
          >
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Sprint Info */}
        {activeSprint && !sprintsLoading && (
          <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {activeSprint.name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {activeSprint.committedPoints} points committed
            </p>
          </div>
        )}

        {/* Task Counts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {tasksLoading ? "-" : taskCounts.todo + taskCounts.inProgress}
              </div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 bg-green-100 dark:bg-green-900/20 rounded">
              <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="font-semibold text-foreground">
                {tasksLoading ? "-" : taskCounts.done}
              </div>
              <div className="text-xs text-muted-foreground">Done</div>
            </div>
          </div>
        </div>

        {/* Blocked Warning */}
        {taskCounts.blocked > 0 && (
          <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
            <span>
              {taskCounts.blocked} blocked task
              {taskCounts.blocked !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Recent Activity */}
        <div className="text-xs text-muted-foreground">
          {lastActivity ? (
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last activity: {getTimeAgo(lastActivity)}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              No activity yet
            </span>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/project-management/${projectId}/board`}>
          <Button className="w-full gap-2" variant="default">
            <Kanban className="w-4 h-4" />
            Go to Board
            <ArrowRight className="w-4 h-4 ml-auto" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

/**
 * Main Landing Page Component
 */
export default function ProjectManagementPage() {
  const [search, setSearch] = useState("");

  const { projects, isLoading, error } = useProjects();

  // Filter projects based on search
  const filteredProjects = useMemo(() => {
    if (!search) return projects;

    const searchLower = search.toLowerCase();
    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(searchLower) ||
        project.company.toLowerCase().includes(searchLower)
    );
  }, [projects, search]);

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Project Management
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your agile projects, sprints, and tasks
          </p>
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 search-input"
              aria-label="Search projects"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Error Loading Projects
              </h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          search ? (
            <EmptyState
              icon={Search}
              title="No projects found"
              description={`No projects match "${search}". Try a different search term.`}
            />
          ) : (
            <EmptyState
              icon={Kanban}
              title="No projects yet"
              description="Get started by creating your first project from the Projects page. You'll be able to manage tasks, sprints, and track progress."
            />
          )
        ) : (
          <>
            {search && (
              <div className="text-sm text-muted-foreground">
                Found {filteredProjects.length} project
                {filteredProjects.length !== 1 ? "s" : ""}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

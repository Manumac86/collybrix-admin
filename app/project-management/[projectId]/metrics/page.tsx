"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  useSprints,
  useVelocity,
  useBurndown,
  useSprintSummary,
  useProjectSummary,
  useTasks,
  useUsers,
} from "@/hooks/pm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BurndownChart } from "@/components/pm/metrics/burndown-chart";
import { VelocityChart } from "@/components/pm/metrics/velocity-chart";
import { MetricsSummary } from "@/components/pm/metrics/metrics-summary";
import { TeamWorkload } from "@/components/pm/metrics/team-workload";
import { TaskDistribution } from "@/components/pm/metrics/task-distribution";
import { SprintHealthIndicator } from "@/components/pm/metrics/sprint-health-indicator";
import { EpicProgress } from "@/components/pm/metrics/epic-progress";
import {
  BarChart3,
  Download,
  RefreshCw,
  TrendingUp,
  Users,
  Target,
  Loader2,
} from "lucide-react";
import { TaskType, TaskPriority } from "@/types/pm";

interface PageProps {
  params: Promise<{ projectId: string }>;
}

export default function MetricsPage({ params }: PageProps) {
  const { projectId } = use(params);
  const router = useRouter();

  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch data
  const { sprints, isLoading: sprintsLoading } = useSprints(projectId, [
    "active",
    "completed",
  ]);
  const {
    velocityData,
    averageVelocity,
    isLoading: velocityLoading,
  } = useVelocity(projectId, 6);
  const { burndownData, isLoading: burndownLoading } =
    useBurndown(selectedSprintId);
  const {
    summary: sprintSummary,
    isLoading: sprintSummaryLoading,
    mutate: mutateSprintSummary,
  } = useSprintSummary(selectedSprintId);
  const { summary: projectSummary, isLoading: projectSummaryLoading } =
    useProjectSummary(projectId);
  const { tasks, isLoading: tasksLoading } = useTasks(projectId, {
    sprintId: selectedSprintId || undefined,
  });
  const { users, isLoading: usersLoading } = useUsers({ isActive: true });

  // Auto-select active sprint on load
  if (!selectedSprintId && sprints.length > 0 && !sprintsLoading) {
    const activeSprint = sprints.find((s) => s.status === "active");
    if (activeSprint) {
      setSelectedSprintId(activeSprint._id.toString());
    }
  }

  const isLoading =
    sprintsLoading ||
    velocityLoading ||
    burndownLoading ||
    sprintSummaryLoading ||
    projectSummaryLoading ||
    tasksLoading ||
    usersLoading;

  const handleRefresh = () => {
    mutateSprintSummary();
  };

  const handleExport = () => {
    // Placeholder for export functionality
    alert(
      "Export functionality coming soon! This will generate a PDF/CSV report."
    );
  };

  const handleUserClick = (userId: string) => {
    // Navigate to tasks filtered by user
    router.push(`/project-management/${projectId}/tasks?assigneeId=${userId}`);
  };

  const handleTypeClick = (type: TaskType) => {
    router.push(`/project-management/${projectId}/tasks?type=${type}`);
  };

  const handlePriorityClick = (priority: TaskPriority) => {
    router.push(`/project-management/${projectId}/tasks?priority=${priority}`);
  };

  const handleEpicClick = (epicId: string) => {
    router.push(`/project-management/${projectId}/tasks?parentId=${epicId}`);
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metrics Dashboard</h1>
          <p className="text-muted-foreground">
            Track sprint progress, team velocity, and project health
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Sprint Selector */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Select Sprint</CardTitle>
              <CardDescription>
                Choose a sprint to view detailed metrics
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {autoRefresh && (
                <>
                  <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
                  <span>Auto-refresh: 30s</span>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedSprintId || ""}
            onValueChange={(value) => setSelectedSprintId(value)}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a sprint" />
            </SelectTrigger>
            <SelectContent>
              {sprints.map((sprint) => (
                <SelectItem
                  key={sprint._id.toString()}
                  value={sprint._id.toString()}
                >
                  {sprint.name} ({sprint.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && !sprintSummary && (
        <div className="flex h-[400px] items-center justify-center">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading metrics...</p>
          </div>
        </div>
      )}

      {/* No Sprint Selected */}
      {!selectedSprintId && !isLoading && (
        <Card>
          <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <BarChart3 className="h-12 w-12" />
              <p className="text-lg font-medium">
                Select a sprint to view metrics
              </p>
              <p className="text-sm">Choose a sprint from the dropdown above</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sprint Metrics Section */}
      {selectedSprintId && sprintSummary && (
        <>
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Target className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Sprint Metrics</h2>
            </div>

            {/* Sprint Health */}
            <div className="mb-4">
              <SprintHealthIndicator summary={sprintSummary} />
            </div>

            {/* KPI Summary Cards */}
            <div className="mb-4">
              <MetricsSummary summary={sprintSummary} />
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 lg:grid-cols-2">
              {burndownData && <BurndownChart data={burndownData} />}
              <VelocityChart
                velocityData={velocityData}
                averageVelocity={averageVelocity}
              />
            </div>
          </div>

          <Separator />

          {/* Team Metrics Section */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Users className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Team Metrics</h2>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <TeamWorkload
                tasks={tasks}
                users={users}
                onUserClick={handleUserClick}
              />
              <EpicProgress tasks={tasks} onEpicClick={handleEpicClick} />
            </div>
          </div>

          <Separator />

          {/* Task Distribution Section */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Task Distribution</h2>
            </div>

            <TaskDistribution
              tasks={tasks}
              onTypeClick={handleTypeClick}
              onPriorityClick={handlePriorityClick}
            />
          </div>
        </>
      )}

      {/* Project-Level Summary (always visible) */}
      {projectSummary && (
        <>
          <Separator />
          <div>
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <h2 className="text-2xl font-bold">Project Overview</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">
                    Total Tasks
                  </div>
                  <div className="text-2xl font-bold">
                    {projectSummary.totalTasks}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">
                    Total Story Points
                  </div>
                  <div className="text-2xl font-bold">
                    {projectSummary.totalStoryPoints}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">
                    Average Velocity
                  </div>
                  <div className="text-2xl font-bold">
                    {projectSummary.averageVelocity}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    points/sprint
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="text-sm text-muted-foreground">Bug Ratio</div>
                  <div className="text-2xl font-bold">
                    {projectSummary.bugRatio}%
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useState, use, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Target } from "lucide-react";
import {
  useSprint,
  useSprintTasks,
  useUpdateSprint,
  useDeleteSprint,
  useSprints,
  useRetrospective,
  useCreateRetrospective,
  useUpdateRetrospective,
  useCreateRetroCard,
  useVoteRetroCard,
  useDeleteRetroCard,
  useCreateRetroAction,
  useUpdateRetroAction,
  useDeleteRetroAction,
  useUsers,
} from "@/hooks/pm";
import { SprintFormData } from "@/types/pm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SprintHeader } from "@/components/pm/sprint/sprint-header";
import { SprintDialog } from "@/components/pm/sprint/sprint-dialog";
import { CompleteSprintDialog } from "@/components/pm/sprint/complete-sprint-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RetrospectiveBoard,
  ActionItemsList,
} from "@/components/pm/retrospective";
import { toast } from "sonner";

interface SprintDetailPageProps {
  params: Promise<{
    projectId: string;
    sprintId: string;
  }>;
}

/**
 * SprintDetailPage Component
 *
 * Main sprint detail view showing:
 * - Sprint header with progress
 * - Tabs for: Overview | Tasks | Retrospective
 * - Overview: Sprint goal, metrics, task breakdown
 * - Tasks: List of all tasks in sprint
 *
 * Usage: /project-management/[projectId]/sprints/[sprintId]
 */
export default function SprintDetailPage({ params }: SprintDetailPageProps) {
  const { projectId, sprintId } = use(params);
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);

  const {
    sprint,
    isLoading: isLoadingSprint,
    mutate: mutateSprint,
  } = useSprint(sprintId);
  const {
    tasks,
    isLoading: isLoadingTasks,
    mutate: mutateTasks,
  } = useSprintTasks(sprintId);
  const { sprints: allSprints } = useSprints(projectId);
  const { users } = useUsers();
  const { trigger: updateSprint, isMutating: isUpdating } =
    useUpdateSprint(sprintId);
  const { trigger: deleteSprint, isMutating: isDeleting } =
    useDeleteSprint(sprintId);

  // Retrospective hooks
  const {
    retrospective,
    isLoading: isLoadingRetro,
    mutate: mutateRetro,
  } = useRetrospective(sprintId);
  const { trigger: createRetrospective } = useCreateRetrospective();
  const { trigger: updateRetrospective } = useUpdateRetrospective(sprintId);
  const { trigger: createRetroCard } = useCreateRetroCard(sprintId);
  const { trigger: voteRetroCard } = useVoteRetroCard(sprintId);
  const { trigger: deleteRetroCard } = useDeleteRetroCard(sprintId);
  const { trigger: createRetroAction } = useCreateRetroAction(sprintId);
  const { trigger: updateRetroAction } = useUpdateRetroAction(sprintId);
  const { trigger: deleteRetroAction } = useDeleteRetroAction(sprintId);

  // Filter available sprints (active or planning, excluding current sprint)
  const availableSprints = useMemo(() => {
    return allSprints.filter(
      (s) =>
        (s.status === "active" || s.status === "planning") &&
        s._id.toString() !== sprintId
    );
  }, [allSprints, sprintId]);

  // Get unfinished tasks
  const unfinishedTasks = useMemo(() => {
    return tasks.filter((task) => task.status !== "done");
  }, [tasks]);

  const handleUpdateSprint = async (data: Partial<SprintFormData>) => {
    try {
      await updateSprint(data);
      toast.success("Sprint updated successfully");
      setIsDialogOpen(false);
      mutateSprint();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update sprint"
      );
    }
  };

  const handleStartSprint = async () => {
    if (!sprint) return;

    try {
      const committedPoints = tasks.reduce(
        (sum, task) => sum + (task.storyPoints || 0),
        0
      );

      await fetch(`/api/pm/sprints/${sprintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          committedPoints,
        }),
      });

      toast.success(
        `${sprint.name} started with ${committedPoints} committed points`
      );
      mutateSprint();
    } catch (error) {
      toast.error("Failed to start sprint");
    }
  };

  const handleCompleteSprint = async () => {
    if (!sprint) return;

    // If there are unfinished tasks, show the dialog
    if (unfinishedTasks.length > 0) {
      setIsCompleteDialogOpen(true);
      return;
    }

    // Otherwise, complete the sprint directly
    try {
      await fetch(`/api/pm/sprints/${sprintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
        }),
      });

      toast.success(`${sprint.name} completed`);
      mutateSprint();
    } catch (error) {
      toast.error("Failed to complete sprint");
    }
  };

  const handleCompleteSprintConfirmed = async () => {
    if (!sprint) return;

    await fetch(`/api/pm/sprints/${sprintId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "completed",
      }),
    });

    mutateSprint();
    mutateTasks();
  };

  const handleCreateNewSprint = async (sprintData: {
    name: string;
    goal: string;
    startDate: Date;
    endDate: Date;
    capacity: number;
  }) => {
    const response = await fetch("/api/pm/sprints", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...sprintData,
        projectId,
        status: "planning",
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || "Failed to create sprint");
    }

    const result = await response.json();
    return { _id: result.data._id.toString() };
  };

  const handleDeleteSprint = async () => {
    if (!sprint) return;

    try {
      await deleteSprint();
      toast.success(`${sprint.name} deleted`);
      router.push(`/project-management/${projectId}/sprints`);
    } catch (error) {
      toast.error("Failed to delete sprint");
    }
  };

  // Retrospective handlers
  const handleStartRetro = async () => {
    try {
      await createRetrospective({
        sprintId,
        format: "mad-sad-glad",
        settings: {
          allowAnonymous: true,
          votesPerPerson: 3,
          timerMinutes: null,
        },
      });
      toast.success("Retrospective started!");
      mutateRetro();
    } catch (error) {
      toast.error("Failed to start retrospective");
    }
  };

  const handleAddCard = async (
    column: string,
    content: string,
    isAnonymous: boolean
  ) => {
    await createRetroCard({
      column,
      content,
      isAnonymous,
    });
    mutateRetro();
  };

  const handleVoteCard = async (cardId: string, action: "add" | "remove") => {
    await voteRetroCard({ cardId, action });
    mutateRetro();
  };

  const handleDeleteCard = async (cardId: string) => {
    await deleteRetroCard({ cardId });
    mutateRetro();
  };

  const handleCreateAction = async (data: {
    title: string;
    description?: string;
    assigneeId?: string | null;
    dueDate?: Date | null;
  }) => {
    await createRetroAction(data);
    mutateRetro();
  };

  const handleUpdateAction = async (
    actionId: string,
    data: {
      title?: string;
      description?: string;
      assigneeId?: string | null;
      status?: "todo" | "in_progress" | "done";
      dueDate?: Date | null;
    }
  ) => {
    await updateRetroAction({ actionId, ...data });
    mutateRetro();
  };

  const handleDeleteAction = async (actionId: string) => {
    await deleteRetroAction({ actionId });
    mutateRetro();
  };

  if (isLoadingSprint) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sprint not found</p>
      </div>
    );
  }

  const tasksByStatus = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Sprint Header */}
      <SprintHeader
        sprint={sprint}
        onEdit={() => setIsDialogOpen(true)}
        onStart={handleStartSprint}
        onComplete={handleCompleteSprint}
        onDelete={handleDeleteSprint}
      />

      {/* Quick Actions */}
      {sprint.status === "planning" && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  Ready to plan?
                </h3>
                <p className="text-sm text-blue-700">
                  Add tasks to this sprint and commit when ready.
                </p>
              </div>
              <Button
                onClick={() =>
                  router.push(
                    `/project-management/${projectId}/sprints/${sprintId}/planning`
                  )
                }
              >
                <Target className="h-4 w-4 mr-2" />
                Go to Planning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
          {sprint.status === "completed" && (
            <TabsTrigger value="retrospective">Retrospective</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Sprint Goal */}
          <Card>
            <CardHeader>
              <CardTitle>Sprint Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{sprint.goal}</p>
            </CardContent>
          </Card>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Total Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{tasks.length}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Story Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {sprint.completedPoints} / {sprint.committedPoints}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {sprint.committedPoints > 0
                    ? Math.round(
                        (sprint.completedPoints / sprint.committedPoints) * 100
                      )
                    : 0}
                  %
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Task Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Task Breakdown by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(tasksByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="p-4 border rounded-lg text-center"
                  >
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {status.replace("_", " ")}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks">
          <Card>
            <CardHeader>
              <CardTitle>Sprint Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : tasks.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No tasks in sprint
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tasks.map((task) => (
                    <div
                      key={task._id.toString()}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium truncate">{task.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{task.type}</Badge>
                          <Badge variant="outline">{task.status}</Badge>
                          {task.storyPoints && (
                            <Badge variant="outline">
                              {task.storyPoints} pts
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          router.push(
                            `/project-management/${projectId}/tasks/${task._id.toString()}`
                          )
                        }
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retrospective Tab */}
        {sprint.status === "completed" && (
          <TabsContent value="retrospective" className="space-y-6">
            {isLoadingRetro ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                </CardContent>
              </Card>
            ) : !retrospective ? (
              <Card>
                <CardHeader>
                  <CardTitle>Sprint Retrospective</CardTitle>
                </CardHeader>
                <CardContent className="py-12 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <p className="text-sm text-muted-foreground">
                      No retrospective session yet. Start one to reflect on the
                      sprint!
                    </p>
                    <Button onClick={handleStartRetro}>
                      Start Retrospective
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Retrospective Board */}
                <RetrospectiveBoard
                  format={retrospective.session.format}
                  cards={retrospective.cards}
                  users={users}
                  onAddCard={handleAddCard}
                  onVoteCard={handleVoteCard}
                  onDeleteCard={handleDeleteCard}
                  allowAnonymous={retrospective.session.settings.allowAnonymous}
                  maxVotes={retrospective.session.settings.votesPerPerson}
                />

                {/* Action Items */}
                <ActionItemsList
                  actions={retrospective.actions}
                  cards={retrospective.cards}
                  users={users}
                  onCreateAction={handleCreateAction}
                  onUpdateAction={handleUpdateAction}
                  onDeleteAction={handleDeleteAction}
                />
              </>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Sprint Dialog */}
      <SprintDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        sprint={sprint}
        projectId={projectId}
        onSubmit={handleUpdateSprint}
        isLoading={isUpdating}
      />

      {/* Complete Sprint Dialog */}
      <CompleteSprintDialog
        open={isCompleteDialogOpen}
        onOpenChange={setIsCompleteDialogOpen}
        sprint={sprint}
        unfinishedTasks={unfinishedTasks}
        availableSprints={availableSprints}
        projectId={projectId}
        onComplete={handleCompleteSprintConfirmed}
        onCreateNewSprint={handleCreateNewSprint}
      />
    </div>
  );
}

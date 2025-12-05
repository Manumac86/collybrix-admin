"use client";

import { use, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import {
  useSprints,
  useCreateSprint,
  useUpdateSprint,
  useDeleteSprint,
  usePatchSprint,
} from "@/hooks/pm";
import { Sprint, SprintFormData, SprintStatus } from "@/types/pm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SprintCard } from "@/components/pm/sprint/sprint-card";
import { SprintDialog } from "@/components/pm/sprint/sprint-dialog";
import { toast } from "sonner";

interface SprintsPageProps {
  params: Promise<{
    projectId: string;
  }>;
}

/**
 * SprintsListPage Component
 *
 * Shows all sprints for a project
 * - Tabs for: Active | Planning | Completed | All
 * - "New Sprint" button
 * - Grid of sprint cards
 * - Empty state when no sprints
 *
 * Usage: /project-management/[projectId]/sprints
 */
export default function SprintsPage({ params }: SprintsPageProps) {
  const { projectId } = use(params);
  const [activeTab, setActiveTab] = useState<
    "active" | "planning" | "completed" | "all"
  >("active");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Sprint | undefined>();

  // Fetch sprints based on active tab
  const statusFilter: SprintStatus | SprintStatus[] | undefined =
    activeTab === "all"
      ? undefined
      : activeTab === "active"
      ? "active"
      : activeTab === "planning"
      ? "planning"
      : "completed";

  const { sprints, isLoading, mutate } = useSprints(projectId, statusFilter);
  const { trigger: createSprint, isMutating: isCreating } = useCreateSprint();
  const { trigger: updateSprint, isMutating: isUpdating } = useUpdateSprint(
    editingSprint?._id.toString() || null
  );
  const { trigger: patchSprint } = usePatchSprint(null);
  const { trigger: deleteSprint } = useDeleteSprint(null);

  const handleCreateSprint = async (data: Partial<SprintFormData>) => {
    try {
      await createSprint(data);
      toast.success("Sprint created successfully");
      setIsDialogOpen(false);
      mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create sprint"
      );
    }
  };

  const handleUpdateSprint = async (data: Partial<SprintFormData>) => {
    if (!editingSprint) return;
    try {
      await updateSprint(data);
      toast.success("Sprint updated successfully");
      setIsDialogOpen(false);
      setEditingSprint(undefined);
      mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update sprint"
      );
    }
  };

  const handleStartSprint = async (sprint: Sprint) => {
    try {
      // Calculate committed points from current tasks
      const sprintId = sprint._id.toString();
      const response = await fetch(`/api/pm/tasks?sprintId=${sprintId}`);
      const data = await response.json();
      const tasks = data.data || [];
      const committedPoints = tasks.reduce(
        (sum: number, task: any) => sum + (task.storyPoints || 0),
        0
      );

      // Update sprint to active status with committed points
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
      mutate();
    } catch (error) {
      toast.error("Failed to start sprint");
    }
  };

  const handleCompleteSprint = async (sprint: Sprint) => {
    try {
      const sprintId = sprint._id.toString();
      await fetch(`/api/pm/sprints/${sprintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
        }),
      });

      toast.success(`${sprint.name} completed`);
      mutate();
    } catch (error) {
      toast.error("Failed to complete sprint");
    }
  };

  const handleDeleteSprint = async (sprint: Sprint) => {
    try {
      const sprintId = sprint._id.toString();
      await fetch(`/api/pm/sprints/${sprintId}`, {
        method: "DELETE",
      });

      toast.success(`${sprint.name} deleted`);
      mutate();
    } catch (error) {
      toast.error("Failed to delete sprint");
    }
  };

  const handleEditClick = (sprint: Sprint) => {
    setEditingSprint(sprint);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingSprint(undefined);
  };

  return (
    <div className="space-y-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sprints</h1>
          <p className="text-muted-foreground">Manage your project sprints</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Sprint
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="planning">Planning</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sprints.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                {activeTab === "all"
                  ? "No sprints yet"
                  : `No ${activeTab} sprints`}
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Sprint
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sprints.map((sprint) => (
                <SprintCard
                  key={sprint._id.toString()}
                  sprint={sprint}
                  projectId={projectId}
                  onEdit={() => handleEditClick(sprint)}
                  onStart={() => handleStartSprint(sprint)}
                  onComplete={() => handleCompleteSprint(sprint)}
                  onDelete={() => handleDeleteSprint(sprint)}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Sprint Dialog */}
      <SprintDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        sprint={editingSprint}
        projectId={projectId}
        onSubmit={editingSprint ? handleUpdateSprint : handleCreateSprint}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}

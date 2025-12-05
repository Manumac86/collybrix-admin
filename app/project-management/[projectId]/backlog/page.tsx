"use client";

import { useState, useMemo } from "react";
import { use } from "react";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BacklogToolbar } from "@/components/pm/backlog/backlog-toolbar";
import { BacklogList } from "@/components/pm/backlog/backlog-list";
import { TaskDialog } from "@/components/pm/task/task-dialog";
import {
  useTasks,
  useCreateTask,
  useDeleteTask,
  useUpdateTask,
  useUsers,
} from "@/hooks/pm";
import { useProject } from "@/hooks/projects";
import { Plus, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";
import type { TaskStatus, TaskType, TaskPriority, Task } from "@/types/pm";
import { getPrioritySortValue } from "@/lib/pm-utils";

interface BacklogPageProps {
  params: Promise<{ projectId: string }>;
}

export default function BacklogPage({ params }: BacklogPageProps) {
  const resolvedParams = use(params);
  const { projectId } = resolvedParams;
  const { toast } = useToast();

  // Get current authenticated user from Clerk
  const { userId } = useAuth();

  // Fetch users for assignment
  const { users } = useUsers();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<TaskType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">(
    "all"
  );
  const [assigneeFilter, setAssigneeFilter] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState("createdAt-desc");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { project, isLoading: projectLoading } = useProject(projectId);

  const filters = useMemo(() => {
    const result: any = {};
    if (statusFilter !== "all") result.status = statusFilter;
    if (typeFilter !== "all") result.type = typeFilter;
    if (priorityFilter !== "all") result.priority = priorityFilter;
    if (assigneeFilter !== "all") result.assigneeId = assigneeFilter;
    if (search) result.search = search;
    return result;
  }, [statusFilter, typeFilter, priorityFilter, assigneeFilter, search]);

  const { tasks, isLoading, error, mutate } = useTasks(projectId, filters);
  const { trigger: createTask } = useCreateTask();
  const { trigger: deleteTask } = useDeleteTask(null);
  const { trigger: updateTask } = useUpdateTask(
    selectedTask?._id.toString() || null
  );

  const sortedTasks = useMemo(() => {
    const [field, order] = sortBy.split("-");
    const sorted = [...tasks];

    sorted.sort((a, b) => {
      let aVal: any;
      let bVal: any;

      switch (field) {
        case "priority":
          aVal = getPrioritySortValue(a.priority);
          bVal = getPrioritySortValue(b.priority);
          break;
        case "storyPoints":
          aVal = a.storyPoints || 0;
          bVal = b.storyPoints || 0;
          break;
        case "title":
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case "createdAt":
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          aVal = new Date(a.updatedAt).getTime();
          bVal = new Date(b.updatedAt).getTime();
          break;
        default:
          return 0;
      }

      if (order === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return sorted;
  }, [tasks, sortBy]);

  const handleCreateTask = async (data: any) => {
    try {
      await createTask(data);
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
      mutate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTaskSelect = (taskId: string, selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) return;

    try {
      // Delete tasks by calling the API directly
      await Promise.all(
        Array.from(selectedTasks).map(async (taskId) => {
          const response = await fetch(`/api/pm/tasks/${taskId}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || "Failed to delete task");
          }

          return response.json();
        })
      );

      toast({
        title: "Tasks deleted",
        description: `${selectedTasks.size} task(s) have been archived.`,
      });

      setSelectedTasks(new Set());
      mutate();
    } catch (error) {
      console.error("[Backlog] Failed to delete tasks:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete tasks. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setEditDialogOpen(true);
  };

  const handleEditTask = async (data: any) => {
    if (!selectedTask) return;

    try {
      await fetch(`/api/pm/tasks/${selectedTask._id.toString()}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      sonnerToast.success("Task updated successfully");
      mutate();
      setEditDialogOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("[Backlog] Failed to update task:", error);
      sonnerToast.error("Failed to update task. Please try again.");
    }
  };

  if (projectLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <p className="text-muted-foreground">
            The project you are looking for does not exist.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Backlog</h1>
          <p className="text-muted-foreground mt-1">
            Manage tasks for {project.name}
          </p>
        </div>
      </div>

      <BacklogToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        assigneeFilter={assigneeFilter}
        onAssigneeFilterChange={setAssigneeFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedCount={selectedTasks.size}
        onBulkDelete={handleBulkDelete}
      />

      {error && (
        <Card className="p-4 border-destructive">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">Error loading tasks: {error}</p>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${sortedTasks.length} tasks`}
          </p>
        </div>

        <BacklogList
          tasks={sortedTasks}
          viewMode={viewMode}
          selectedTasks={selectedTasks}
          onTaskSelect={handleTaskSelect}
          onTaskClick={handleTaskClick}
          isLoading={isLoading}
        />
      </div>

      {/* Edit Task Dialog */}
      {selectedTask && (
        <TaskDialog
          open={editDialogOpen}
          onOpenChange={(open) => {
            setEditDialogOpen(open);
            if (!open) setSelectedTask(null);
          }}
          onSubmit={handleEditTask}
          task={selectedTask}
          projectId={projectId}
          currentUserId={userId || ""}
          users={users}
          availableTasks={tasks}
          mode="edit"
        />
      )}
    </div>
  );
}

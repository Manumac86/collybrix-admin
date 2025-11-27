"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2, ArrowLeft, Edit, Trash2, AlertCircle } from "lucide-react";
import { useTask, useUpdateTask, useDeleteTask, useTasks, useUsers } from "@/hooks/pm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { PriorityBadge } from "@/components/pm/shared/priority-badge";
import { StatusBadge } from "@/components/pm/shared/status-badge";
import { UserAvatar } from "@/components/pm/shared/user-avatar";
import { TaskDialog } from "@/components/pm/task/task-dialog";
import { formatDate } from "@/lib/pm-utils";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "@/types/pm";

interface TaskDetailPageProps {
  params: Promise<{
    projectId: string;
    taskId: string;
  }>;
}

export default function TaskDetailPage({ params }: TaskDetailPageProps) {
  const { projectId, taskId } = use(params);
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get current authenticated user from Clerk
  const { userId } = useAuth();

  const { task, isLoading, error, mutate } = useTask(taskId);
  const { tasks: allTasks } = useTasks(projectId, {});
  const { users } = useUsers();
  const { trigger: updateTask } = useUpdateTask(taskId);
  const { trigger: deleteTask } = useDeleteTask(taskId);

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case "epic":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "story":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "task":
        return "bg-gray-100 text-gray-800 border-gray-300";
      case "bug":
        return "bg-red-100 text-red-800 border-red-300";
      case "spike":
        return "bg-indigo-100 text-indigo-800 border-indigo-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const handleUpdateTask = async (data: any) => {
    try {
      await fetch(`/api/pm/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      toast.success("Task updated successfully");
      mutate();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("[Task Detail] Failed to update task:", error);
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async () => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await deleteTask();
      toast.success("Task deleted successfully");
      router.push(`/project-management/${projectId}/backlog`);
    } catch (error) {
      console.error("[Task Detail] Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="p-6">
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Task not found</h2>
          <p className="text-muted-foreground mb-4">
            {error || "The task you are looking for does not exist."}
          </p>
          <Button onClick={() => router.push(`/project-management/${projectId}/backlog`)}>
            Back to Backlog
          </Button>
        </Card>
      </div>
    );
  }

  const assignee = users.find((u) => u._id.toString() === task.assigneeId?.toString());
  const reporter = users.find((u) => u._id.toString() === task.reporterId?.toString());
  const childrenTasks = task.type === "epic" || task.type === "story"
    ? allTasks.filter((t) => t.parentId?.toString() === task._id.toString())
    : [];

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/project-management/${projectId}/backlog`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Backlog
          </Button>

          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge className={getTypeColor(task.type)}>
              {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
            </Badge>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            <span className="text-sm text-muted-foreground font-mono">
              #{task._id.toString().slice(-6).toUpperCase()}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight break-words">
            {task.title}
          </h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDeleteTask}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                {task.description || (
                  <p className="text-muted-foreground italic">No description provided</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Children Tasks */}
          {childrenTasks.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Child Tasks ({childrenTasks.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {childrenTasks.map((childTask) => (
                    <div
                      key={childTask._id.toString()}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/project-management/${projectId}/tasks/${childTask._id.toString()}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={cn("text-xs", getTypeColor(childTask.type))}>
                            {childTask.type}
                          </Badge>
                          <StatusBadge status={childTask.status} size="sm" />
                          <PriorityBadge priority={childTask.priority} size="sm" />
                        </div>
                        <p className="text-sm font-medium">{childTask.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acceptance Criteria */}
          {task.acceptanceCriteria && task.acceptanceCriteria.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Acceptance Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {task.acceptanceCriteria.map((criterion) => (
                    <li key={criterion.id} className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        checked={criterion.completed}
                        readOnly
                        className="mt-1 h-4 w-4 rounded"
                      />
                      <span
                        className={cn(
                          "text-sm",
                          criterion.completed
                            ? "text-muted-foreground line-through"
                            : "text-foreground"
                        )}
                      >
                        {criterion.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Story Points */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  Story Points
                </h4>
                <p className="text-sm font-medium">
                  {task.storyPoints !== null ? `${task.storyPoints} SP` : "—"}
                </p>
              </div>

              <Separator />

              {/* Assignee */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  Assignee
                </h4>
                <div className="flex items-center gap-2">
                  <UserAvatar user={assignee || null} size="sm" />
                  <span className="text-sm">{assignee?.name || "Unassigned"}</span>
                </div>
              </div>

              <Separator />

              {/* Reporter */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground mb-1">
                  Reporter
                </h4>
                <div className="flex items-center gap-2">
                  <UserAvatar user={reporter || null} size="sm" />
                  <span className="text-sm">{reporter?.name || "Unknown"}</span>
                </div>
              </div>

              <Separator />

              {/* Due Date */}
              {task.dueDate && (
                <>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Due Date
                    </h4>
                    <p
                      className={cn(
                        "text-sm font-medium",
                        new Date(task.dueDate) < new Date() &&
                          task.status !== "done" &&
                          "text-red-600"
                      )}
                    >
                      {formatDate(task.dueDate)}
                    </p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Estimated Hours */}
              {task.estimatedHours !== null && (
                <>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Estimated Hours
                    </h4>
                    <p className="text-sm font-medium">{task.estimatedHours}h</p>
                  </div>
                  <Separator />
                </>
              )}

              {/* Actual Hours */}
              {task.actualHours !== null && (
                <>
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Actual Hours
                    </h4>
                    <p className="text-sm font-medium">{task.actualHours}h</p>
                  </div>
                  <Separator />
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Created:</span>{" "}
                  {formatDate(task.createdAt)}
                </div>
                {task.updatedAt && (
                  <div>
                    <span className="font-medium">Updated:</span>{" "}
                    {formatDate(task.updatedAt)}
                  </div>
                )}
                {task.completedAt && (
                  <div>
                    <span className="font-medium">Completed:</span>{" "}
                    {formatDate(task.completedAt)}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      {task && (
        <TaskDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          onSubmit={handleUpdateTask}
          task={task}
          projectId={projectId}
          currentUserId={userId || ""}
          users={users}
          availableTasks={allTasks}
          mode="edit"
        />
      )}
    </div>
  );
}

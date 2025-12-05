"use client";

import { useEffect, useState } from "react";
import { X, Calendar, User, Tag, Clock, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/components/pm/shared/priority-badge";
import { StatusBadge } from "@/components/pm/shared/status-badge";
import { UserAvatar } from "@/components/pm/shared/user-avatar";
import { formatDate } from "@/lib/pm-utils";
import type { Task, User as UserType, Sprint } from "@/types/pm";

interface TaskDetailPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  users: Map<string, UserType>;
  sprints: Sprint[];
  allTasks?: Task[]; // All tasks to find children
  onTaskClick?: (task: Task) => void; // For clicking on child tasks
}

export function TaskDetailPanel({
  task,
  isOpen,
  onClose,
  users,
  sprints,
  allTasks = [],
  onTaskClick,
}: TaskDetailPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!task && !isAnimating) return null;

  const assignee = task?.assigneeId
    ? users.get(task.assigneeId.toString())
    : null;
  const reporter = task?.reporterId
    ? users.get(task.reporterId.toString())
    : null;
  const sprint = task?.sprintId
    ? sprints.find((s) => s._id.toString() === task.sprintId?.toString())
    : null;

  // Find children tasks if this is an Epic or Story
  const childrenTasks =
    task && (task.type === "epic" || task.type === "story")
      ? allTasks.filter((t) => t.parentId?.toString() === task._id.toString())
      : [];

  // Task type color mapping
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

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Side Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 bottom-0 w-[600px] bg-background shadow-2xl z-50 transform transition-transform duration-300 overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {task && (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b p-6">
              <div className="flex-1 min-w-0">
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
                <h2 className="text-2xl font-bold text-foreground break-words">
                  {task.title}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="shrink-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Description
                </h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  {task.description || (
                    <p className="text-muted-foreground italic">
                      No description provided
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Tag className="h-3 w-3" />
                    Type
                  </h4>
                  <Badge
                    variant="outline"
                    className={cn("capitalize", getTypeColor(task.type))}
                  >
                    {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                  </Badge>
                </div>

                {/* Story Points */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Story Points
                  </h4>
                  <p className="text-sm font-medium">
                    {task.storyPoints !== null ? `${task.storyPoints} SP` : "—"}
                  </p>
                </div>

                {/* Assignee */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Assignee
                  </h4>
                  <div className="flex items-center gap-2">
                    <UserAvatar user={assignee || null} size="sm" />
                    <span className="text-sm">
                      {assignee?.name || "Unassigned"}
                    </span>
                  </div>
                </div>

                {/* Reporter */}
                <div>
                  <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Reporter
                  </h4>
                  <div className="flex items-center gap-2">
                    <UserAvatar user={reporter || null} size="sm" />
                    <span className="text-sm">
                      {reporter?.name || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Sprint */}
                <div className="col-span-2">
                  <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Sprint
                  </h4>
                  <p className="text-sm font-medium">
                    {sprint?.name || "No sprint assigned"}
                  </p>
                </div>

                {/* Due Date */}
                {task.dueDate && (
                  <div className="col-span-2">
                    <h4 className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
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
                )}

                {/* Estimated Hours */}
                {task.estimatedHours !== null && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Estimated Hours
                    </h4>
                    <p className="text-sm font-medium">
                      {task.estimatedHours}h
                    </p>
                  </div>
                )}

                {/* Actual Hours */}
                {task.actualHours !== null && (
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">
                      Actual Hours
                    </h4>
                    <p className="text-sm font-medium">{task.actualHours}h</p>
                  </div>
                )}
              </div>

              {/* Children Tasks (for Epic/Story) */}
              {childrenTasks.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">
                      Tasks ({childrenTasks.length})
                    </h3>
                    <div className="space-y-2">
                      {childrenTasks.map((childTask) => {
                        const childAssignee = childTask.assigneeId
                          ? users.get(childTask.assigneeId.toString())
                          : null;
                        return (
                          <Card
                            key={childTask._id.toString()}
                            className="hover:bg-muted/50 transition-colors cursor-pointer p-0"
                            onClick={() => onTaskClick?.(childTask)}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-xs",
                                        getTypeColor(childTask.type)
                                      )}
                                    >
                                      {childTask.type}
                                    </Badge>
                                    <StatusBadge status={childTask.status} />
                                    <PriorityBadge
                                      priority={childTask.priority}
                                    />
                                  </div>
                                  <p className="text-sm font-medium text-foreground">
                                    {childTask.title}
                                  </p>
                                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                    {childTask.storyPoints && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {childTask.storyPoints} SP
                                      </span>
                                    )}
                                    {childAssignee && (
                                      <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {childAssignee.name}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Acceptance Criteria */}
              {task.acceptanceCriteria &&
                task.acceptanceCriteria.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3">
                        Acceptance Criteria
                      </h3>
                      <ul className="space-y-2">
                        {task.acceptanceCriteria.map((criterion) => (
                          <li
                            key={criterion.id}
                            className="flex items-start gap-2"
                          >
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
                    </div>
                  </>
                )}

              {/* Comments Section (Placeholder for Phase 2) */}
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Comments
                </h3>
                <p className="text-sm text-muted-foreground italic">
                  Comments will be available in Phase 2
                </p>
              </div>

              {/* Activity Log (Placeholder for Phase 2) */}
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  Activity
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {formatDate(task.createdAt)}
                    </span>
                    <span>Created by {reporter?.name || "Unknown"}</span>
                  </div>
                  {task.updatedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatDate(task.updatedAt)}
                      </span>
                      <span>Last updated</span>
                    </div>
                  )}
                  {task.completedAt && (
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">
                        {formatDate(task.completedAt)}
                      </span>
                      <span>Completed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-4 bg-muted">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Created {formatDate(task.createdAt)}</span>
                <span>
                  Press{" "}
                  <kbd className="px-2 py-1 bg-background border rounded">
                    Esc
                  </kbd>{" "}
                  to close
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

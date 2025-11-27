"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { PriorityBadge } from "@/components/pm/shared/priority-badge";
import { StatusBadge } from "@/components/pm/shared/status-badge";
import { StoryPointsBadge } from "@/components/pm/shared/story-points-badge";
import { UserAvatar } from "@/components/pm/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Bug,
  Layers,
  CheckSquare,
  Lightbulb,
  Calendar,
} from "lucide-react";
import { formatDate } from "@/lib/pm-utils";
import type { Task, User, Tag } from "@/types/pm";
import { cn } from "@/lib/utils";

interface BacklogListProps {
  tasks: Task[];
  users?: Map<string, User>;
  tags?: Map<string, Tag>;
  viewMode: "list" | "card";
  selectedTasks: Set<string>;
  onTaskSelect: (taskId: string, selected: boolean) => void;
  onTaskClick: (task: Task) => void;
  isLoading?: boolean;
}

const taskTypeIcons = {
  story: FileText,
  task: CheckSquare,
  bug: Bug,
  epic: Layers,
  spike: Lightbulb,
};

function BacklogListSkeleton({ viewMode }: { viewMode: "list" | "card" }) {
  const skeletonItems = Array.from({ length: 5 });

  if (viewMode === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skeletonItems.map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {skeletonItems.map((_, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 animate-pulse bg-gray-50"
        >
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <CheckSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">No tasks found</h3>
          <p className="text-sm text-muted-foreground">
            Try adjusting your filters or create a new task to get started.
          </p>
        </div>
      </div>
    </Card>
  );
}

export function BacklogList({
  tasks,
  users,
  tags,
  viewMode,
  selectedTasks,
  onTaskSelect,
  onTaskClick,
  isLoading = false,
}: BacklogListProps) {
  if (isLoading) {
    return <BacklogListSkeleton viewMode={viewMode} />;
  }

  if (tasks.length === 0) {
    return <EmptyState />;
  }

  const getUser = (userId: string | null) => {
    if (!userId || !users) return null;
    return users.get(userId.toString()) || null;
  };

  const getTaskTags = (tagIds: any[]) => {
    if (!tags || !tagIds) return [];
    return tagIds
      .map((id) => tags.get(id.toString()))
      .filter((tag): tag is Tag => tag !== undefined);
  };

  if (viewMode === "card") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => {
          const TypeIcon = taskTypeIcons[task.type];
          const assignee = getUser(task.assigneeId?.toString() || null);
          const taskTags = getTaskTags(task.tags);
          const isSelected = selectedTasks.has(task._id.toString());

          return (
            <Card
              key={task._id.toString()}
              className={cn(
                "p-4 hover:shadow-md transition-shadow cursor-pointer",
                isSelected && "ring-2 ring-primary"
              )}
              onClick={() => onTaskClick(task)}
            >
              <div className="flex items-start gap-3 mb-3">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    onTaskSelect(task._id.toString(), checked === true)
                  }
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-xs text-muted-foreground font-mono">
                      {task._id.toString().slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="font-medium text-sm mb-2 line-clamp-2">
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                      {task.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                    <StoryPointsBadge points={task.storyPoints} />
                  </div>
                  {taskTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {taskTags.map((tag) => (
                        <Badge
                          key={tag._id.toString()}
                          variant="outline"
                          className="text-xs"
                          style={{ borderColor: tag.color }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <UserAvatar user={assignee} size="sm" />
                      <span>{assignee?.name || "Unassigned"}</span>
                    </div>
                    {task.dueDate && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => {
        const TypeIcon = taskTypeIcons[task.type];
        const assignee = getUser(task.assigneeId?.toString() || null);
        const taskTags = getTaskTags(task.tags);
        const isSelected = selectedTasks.has(task._id.toString());

        return (
          <Card
            key={task._id.toString()}
            className={cn(
              "p-4 hover:shadow-sm transition-shadow cursor-pointer",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => onTaskClick(task)}
          >
            <div className="flex items-center gap-4">
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) =>
                  onTaskSelect(task._id.toString(), checked === true)
                }
                onClick={(e) => e.stopPropagation()}
              />
              <TypeIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground font-mono w-16">
                {task._id.toString().slice(-6).toUpperCase()}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm truncate">{task.title}</h3>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <PriorityBadge priority={task.priority} />
                <StoryPointsBadge points={task.storyPoints} />
                <StatusBadge status={task.status} />
                {taskTags.length > 0 && (
                  <div className="flex gap-1">
                    {taskTags.slice(0, 2).map((tag) => (
                      <Badge
                        key={tag._id.toString()}
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                    {taskTags.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{taskTags.length - 2}
                      </Badge>
                    )}
                  </div>
                )}
                <UserAvatar user={assignee} size="sm" />
                {task.dueDate && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(task.dueDate)}</span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

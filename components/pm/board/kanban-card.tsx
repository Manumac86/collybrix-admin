"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { memo } from "react";
import {
  Bug,
  Lightbulb,
  Layers,
  CheckSquare,
  Target,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PriorityBadge } from "@/components/pm/shared/priority-badge";
import { UserAvatar } from "@/components/pm/shared/user-avatar";
import { Badge } from "@/components/ui/badge";
import type { Task, TaskType, User } from "@/types/pm";

interface KanbanCardProps {
  task: Task;
  assignee?: User | null;
  isDragging?: boolean;
  onClick?: () => void;
}

const TYPE_ICONS: Record<TaskType, typeof Bug> = {
  bug: Bug,
  story: Lightbulb,
  epic: Layers,
  task: CheckSquare,
  spike: Target,
};

const TYPE_COLORS: Record<TaskType, string> = {
  bug: "text-red-500",
  story: "text-green-500",
  epic: "text-purple-500",
  task: "text-blue-500",
  spike: "text-amber-500",
};

const PRIORITY_BORDER_COLORS: Record<string, string> = {
  critical: "border-l-red-600",
  high: "border-l-amber-500",
  medium: "border-l-blue-500",
  low: "border-l-gray-400",
};

function KanbanCardComponent({ task, assignee, isDragging, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task._id.toString(),
    data: { task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const TypeIcon = TYPE_ICONS[task.type];
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done";

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-2 rounded-lg border-l-4 bg-card p-3 shadow-sm transition-all hover:shadow-md cursor-grab active:cursor-grabbing",
        PRIORITY_BORDER_COLORS[task.priority],
        isDragging && "opacity-50 shadow-lg ring-2 ring-blue-500",
        "min-h-[120px]"
      )}
    >
      {/* Header: Type Icon + Task ID */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TypeIcon className={cn("h-4 w-4", TYPE_COLORS[task.type])} />
          <span className="font-mono font-medium">
            {task._id.toString().slice(-6).toUpperCase()}
          </span>
        </div>
        <PriorityBadge priority={task.priority} className="shrink-0" />
      </div>

      {/* Title */}
      <h4 className="line-clamp-2 text-sm font-medium leading-tight text-foreground">
        {task.title}
      </h4>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {task.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.toString()}
              variant="outline"
              className="text-xs h-5 px-1.5"
            >
              Tag
            </Badge>
          ))}
          {task.tags.length > 3 && (
            <Badge variant="outline" className="text-xs h-5 px-1.5">
              +{task.tags.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Footer: Story Points + Assignee + Due Date */}
      <div className="mt-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {task.storyPoints !== null && (
            <Badge variant="secondary" className="h-6 px-2 text-xs font-medium">
              {task.storyPoints} SP
            </Badge>
          )}
          {isOverdue && (
            <div className="flex items-center gap-1 text-xs text-red-600" title="Overdue">
              <Clock className="h-3 w-3" />
            </div>
          )}
        </div>
        <UserAvatar user={assignee || null} size="sm" />
      </div>
    </div>
  );
}

export const KanbanCard = memo(KanbanCardComponent);

"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { memo, useState } from "react";
import { Plus, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { KanbanCard } from "./kanban-card";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus, User } from "@/types/pm";

interface KanbanColumnProps {
  status: TaskStatus;
  title: string;
  tasks: Task[];
  users: Map<string, User>;
  wipLimit?: number;
  onTaskClick: (task: Task) => void;
  onAddTask?: () => void;
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: "bg-gray-500",
  todo: "bg-blue-500",
  in_progress: "bg-yellow-500",
  in_review: "bg-purple-500",
  in_testing: "bg-orange-500",
  done: "bg-green-500",
  blocked: "bg-red-500",
  cancelled: "bg-gray-400",
  archived: "bg-gray-300",
};

function KanbanColumnComponent({
  status,
  title,
  tasks,
  users,
  wipLimit,
  onTaskClick,
  onAddTask,
}: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: { status },
  });

  const taskCount = tasks.length;
  const isOverLimit = wipLimit && taskCount > wipLimit;

  const taskIds = tasks.map((task) => task._id.toString());

  return (
    <div
      className={cn(
        "flex h-full w-80 shrink-0 flex-col rounded-lg border bg-muted",
        isOver && "ring-2 ring-blue-500 bg-blue-50"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between gap-2 border-b bg-card p-3 rounded-t-lg">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 flex-1 text-left hover:opacity-70 transition-opacity"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <div className="flex items-center gap-2">
            <div
              className={cn("h-3 w-3 rounded-full", STATUS_COLORS[status])}
            />
            <h3 className="font-semibold text-sm text-foreground">{title}</h3>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              isOverLimit
                ? "bg-red-100 text-red-700"
                : "bg-accent text-foreground"
            )}
          >
            {taskCount}
            {wipLimit && ` / ${wipLimit}`}
          </span>
          {onAddTask && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddTask}
              className="h-7 w-7 p-0"
              title="Add task"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Column Content */}
      {!isCollapsed && (
        <div
          ref={setNodeRef}
          className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]"
          style={{ maxHeight: "calc(100vh - 250px)" }}
        >
          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground text-sm">
                <p>No tasks</p>
                {onAddTask && (
                  <button
                    onClick={onAddTask}
                    className="mt-2 text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Add task
                  </button>
                )}
              </div>
            ) : (
              tasks.map((task) => {
                const assignee = task.assigneeId
                  ? users.get(task.assigneeId.toString())
                  : null;
                return (
                  <KanbanCard
                    key={task._id.toString()}
                    task={task}
                    assignee={assignee}
                    onClick={() => onTaskClick(task)}
                  />
                );
              })
            )}
          </SortableContext>
        </div>
      )}

      {/* WIP Limit Warning */}
      {!isCollapsed && isOverLimit && (
        <div className="border-t bg-red-50 p-2 text-center text-xs text-red-700">
          WIP limit exceeded ({taskCount} / {wipLimit})
        </div>
      )}
    </div>
  );
}

export const KanbanColumn = memo(KanbanColumnComponent);

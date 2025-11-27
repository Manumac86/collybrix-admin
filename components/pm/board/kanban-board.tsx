"use client";

import { useState, useMemo, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { KanbanColumn } from "./kanban-column";
import { KanbanCard } from "./kanban-card";
import { cn } from "@/lib/utils";
import type { Task, TaskStatus, User } from "@/types/pm";

interface KanbanBoardProps {
  tasks: Task[];
  users: Map<string, User>;
  onTaskClick: (task: Task) => void;
  onTaskMove: (taskId: string, newStatus: TaskStatus) => Promise<void>;
  onAddTask?: (status?: TaskStatus) => void;
  isLoading?: boolean;
}

interface ColumnConfig {
  status: TaskStatus;
  title: string;
  wipLimit?: number;
}

const BOARD_COLUMNS: ColumnConfig[] = [
  { status: "backlog", title: "Backlog" },
  { status: "todo", title: "To Do" },
  { status: "in_progress", title: "In Progress", wipLimit: 5 },
  { status: "in_review", title: "In Review", wipLimit: 3 },
  { status: "in_testing", title: "In Testing", wipLimit: 3 },
  { status: "done", title: "Done" },
];

export function KanbanBoard({
  tasks,
  users,
  onTaskClick,
  onTaskMove,
  onAddTask,
  isLoading,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      in_review: [],
      in_testing: [],
      done: [],
      blocked: [],
      cancelled: [],
      archived: [],
    };

    tasks.forEach((task) => {
      // Safety check: only push if the status exists in grouped
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      } else {
        console.warn(`[Kanban] Unknown task status: ${task.status}, task:`, task);
        // Default to backlog if status is unknown
        grouped.backlog.push(task);
      }
    });

    // Sort tasks by priority within each column
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    Object.keys(grouped).forEach((status) => {
      grouped[status as TaskStatus].sort((a, b) => {
        const priorityDiff =
          priorityOrder[a.priority] - priorityOrder[b.priority];
        if (priorityDiff !== 0) return priorityDiff;
        // If same priority, sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    });

    return grouped;
  }, [tasks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = event.active.data.current?.task;
    if (task) {
      setActiveTask(task);
    }
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setActiveTask(null);

      const { active, over } = event;

      if (!over) return;

      const taskId = active.id as string;

      // Determine the new status
      // The over element can be either:
      // 1. A droppable column (id is the status) - over.data.current.status exists
      // 2. A sortable task card (id is task id) - over.data.current.task exists
      //    In this case, we need to find which column contains this task
      let newStatus: TaskStatus | undefined;

      // If over.data.current.status exists, we dropped on a column droppable
      if (over.data?.current?.status) {
        newStatus = over.data.current.status;
      } else if (over.data?.current?.sortable) {
        // We dropped over a sortable item (task card)
        // Find which column contains this task by looking through tasks
        const overId = over.id as string;
        const overTask = tasks.find((t) => t._id.toString() === overId);
        if (overTask) {
          newStatus = overTask.status;
        }
      }

      // Fallback: check if over.id is a valid status
      if (!newStatus) {
        const possibleStatus = over.id as string;
        if (BOARD_COLUMNS.some((col) => col.status === possibleStatus)) {
          newStatus = possibleStatus as TaskStatus;
        }
      }

      if (!newStatus) {
        console.error("[Kanban] Could not determine new status");
        return;
      }

      // Find the task being moved
      const task = tasks.find((t) => t._id.toString() === taskId);
      if (!task) {
        console.error("[Kanban] Task not found:", taskId);
        return;
      }

      // Check if status actually changed
      if (task.status === newStatus) {
        return;
      }

      // Show loading toast
      const toastId = toast.loading(`Moving task to ${newStatus.replace("_", " ")}...`);

      try {
        // Call the move handler (optimistic update handled in parent)
        await onTaskMove(taskId, newStatus);

        toast.success("Task moved successfully", { id: toastId });
      } catch (error) {
        console.error("[Kanban] Failed to move task:", error);
        toast.error(
          error instanceof Error ? error.message : "Failed to move task",
          { id: toastId }
        );
      }
    },
    [tasks, onTaskMove]
  );

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {BOARD_COLUMNS.map((column) => (
          <div
            key={column.status}
            className="w-80 shrink-0 rounded-lg border bg-gray-50 p-4"
          >
            <div className="h-8 w-32 animate-pulse rounded bg-gray-300 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-32 animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div
        className={cn(
          "flex gap-4 overflow-x-auto pb-4 h-full",
          "scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
        )}
        style={{ minHeight: "calc(100vh - 250px)" }}
      >
        {BOARD_COLUMNS.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            tasks={tasksByStatus[column.status]}
            users={users}
            wipLimit={column.wipLimit}
            onTaskClick={onTaskClick}
            onAddTask={
              onAddTask ? () => onAddTask(column.status) : undefined
            }
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div className="rotate-3 opacity-90 cursor-grabbing">
            <KanbanCard
              task={activeTask}
              assignee={
                activeTask.assigneeId
                  ? users.get(activeTask.assigneeId.toString())
                  : null
              }
              isDragging
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

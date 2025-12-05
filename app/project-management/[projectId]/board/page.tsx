"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Loader2, AlertCircle } from "lucide-react";
import { KanbanBoard } from "@/components/pm/board/kanban-board";
import {
  BoardFilters,
  BoardFiltersState,
} from "@/components/pm/board/board-filters";
import { TaskDetailPanel } from "@/components/pm/task/task-detail-panel";
import { useTasks, usePatchAnyTask, useSprints, useUsers } from "@/hooks/pm";
import { Button } from "@/components/ui/button";
import type { Task, TaskStatus, User, Sprint } from "@/types/pm";

const STORAGE_KEY = "kanban-board-filters";

export default function BoardPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  // Get current authenticated user from Clerk
  const { userId } = useAuth();

  // Fetch users and sprints
  const { users } = useUsers();
  const { sprints } = useSprints(projectId);

  // Load filters from localStorage
  const [filters, setFilters] = useState<BoardFiltersState>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // Ignore parse errors
        }
      }
    }
    return {
      search: "",
      myTasks: false,
      assigneeId: null,
      type: null,
      priority: null,
      sprintId: null,
    };
  });

  // Save filters to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    }
  }, [filters]);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  // Fetch tasks
  const { tasks, isLoading, error, mutate } = useTasks(projectId, {
    projectId,
    // Only include active statuses for the board
    status: [
      "backlog",
      "todo",
      "in_progress",
      "in_review",
      "in_testing",
      "done",
    ],
  });

  // Patch task mutation
  const { trigger: patchTask, isMutating } = usePatchAnyTask();

  // Create users map from real Clerk users
  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    users.forEach((user) => {
      map.set(user._id.toString(), user);
    });
    return map;
  }, [users]);

  // Filter tasks based on current filters
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    // My Tasks filter - use actual Clerk user ID
    if (filters.myTasks && userId) {
      filtered = filtered.filter(
        (task) => task.assigneeId?.toString() === userId
      );
    }

    // Assignee filter
    if (filters.assigneeId) {
      if (filters.assigneeId === "unassigned") {
        filtered = filtered.filter((task) => task.assigneeId === null);
      } else {
        filtered = filtered.filter(
          (task) => task.assigneeId?.toString() === filters.assigneeId
        );
      }
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter((task) => task.type === filters.type);
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter((task) => task.priority === filters.priority);
    }

    // Sprint filter
    if (filters.sprintId) {
      if (filters.sprintId === "unassigned") {
        filtered = filtered.filter((task) => task.sprintId === null);
      } else {
        filtered = filtered.filter(
          (task) => task.sprintId?.toString() === filters.sprintId
        );
      }
    }

    return filtered;
  }, [tasks, filters, userId]);

  // Handle task move
  const handleTaskMove = useCallback(
    async (taskId: string, newStatus: TaskStatus) => {
      // Find the task
      const task = tasks.find((t) => t._id.toString() === taskId);
      if (!task) throw new Error("Task not found");

      // Optimistically update the UI
      mutate(
        (currentData) => {
          if (!currentData?.data) return currentData;
          return {
            ...currentData,
            data: currentData.data.map((t) =>
              t._id.toString() === taskId
                ? { ...t, status: newStatus, updatedAt: new Date() }
                : t
            ),
          };
        },
        { revalidate: false }
      );

      // Make the API call
      try {
        await patchTask({
          taskId,
          updates: { status: newStatus },
        });

        // Revalidate to get server state
        await mutate();
      } catch (error) {
        // Revalidate on error to restore correct state
        await mutate();
        throw error;
      }
    },
    [tasks, patchTask, mutate]
  );

  // Handle task click
  const handleTaskClick = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  }, []);

  // Handle close panel
  const handleClosePanel = useCallback(() => {
    setIsPanelOpen(false);
    // Delay clearing selectedTask to allow animation to complete
    setTimeout(() => setSelectedTask(null), 300);
  }, []);

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Tasks
          </h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={() => mutate()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Filters - with padding */}
      <div className="pt-6 space-y-4">
        <BoardFilters
          filters={filters}
          onFiltersChange={setFilters}
          users={users}
          sprints={sprints}
          currentUserId={userId || undefined}
        />

        {/* Task Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredTasks.length} of {tasks.length} tasks
        </div>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <KanbanBoard
            tasks={filteredTasks}
            users={usersMap}
            onTaskClick={handleTaskClick}
            onTaskMove={handleTaskMove}
            isLoading={isMutating}
          />
        </div>
      )}

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
        users={usersMap}
        sprints={sprints}
        allTasks={tasks}
        onTaskClick={handleTaskClick}
      />
    </div>
  );
}

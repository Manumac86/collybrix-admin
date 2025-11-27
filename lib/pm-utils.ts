import {
  Task,
  Sprint,
  TaskStatus,
  TaskPriority,
  StoryPoint,
  BurndownDataPoint,
  TeamWorkload,
  TASK_STATUSES,
} from "@/types/pm";

// ============================================================================
// SPRINT METRICS UTILITIES
// ============================================================================

/**
 * Calculate sprint velocity (completed story points)
 * @param tasks - All tasks in the sprint
 * @returns Total completed story points
 */
export function calculateSprintVelocity(tasks: Task[]): number {
  return tasks
    .filter((task) => task.status === "done" && task.storyPoints !== null)
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);
}

/**
 * Calculate sprint progress
 * @param sprint - The sprint
 * @param tasks - All tasks in the sprint
 * @returns Progress metrics
 */
export function calculateSprintProgress(
  sprint: Sprint,
  tasks: Task[]
): {
  percentageCompleted: number;
  daysRemaining: number;
  totalDays: number;
  isOverCapacity: boolean;
} {
  const completedPoints = calculateSprintVelocity(tasks);
  const totalPoints = tasks
    .filter((task) => task.storyPoints !== null)
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  console.log("totalPoints", totalPoints);
  console.log("completedPoints", completedPoints);
  console.log(
    "percentageCompleted",
    Math.round((completedPoints / totalPoints) * 100)
  );

  const percentageCompleted =
    totalPoints > 0 ? Math.round((completedPoints / totalPoints) * 100) : 0;

  const now = new Date();
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);

  const totalDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysElapsed = Math.ceil(
    (now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  const isOverCapacity = totalPoints > sprint.capacity;

  return {
    percentageCompleted,
    daysRemaining,
    totalDays,
    isOverCapacity,
  };
}

/**
 * Generate burndown chart data
 * @param sprint - The sprint
 * @param tasks - All tasks in the sprint
 * @returns Burndown data points for each day
 */
export function getBurndownData(
  sprint: Sprint,
  tasks: Task[]
): BurndownDataPoint[] {
  const start = new Date(sprint.startDate);
  const end = new Date(sprint.endDate);
  const today = new Date();

  const totalPoints = tasks
    .filter((task) => task.storyPoints !== null)
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  const totalDays = Math.ceil(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  );
  const dailyIdealBurndown = totalPoints / totalDays;

  const burndownData: BurndownDataPoint[] = [];

  // Generate data for each day of the sprint
  for (let day = 0; day <= totalDays; day++) {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + day);

    // Don't show future data for active sprints
    if (currentDate > today && sprint.status === "active") {
      break;
    }

    const dateString = currentDate.toISOString().split("T")[0];

    // Calculate actual completed points up to this date
    const completedPoints = tasks
      .filter((task) => {
        if (task.status !== "done" || !task.completedAt || !task.storyPoints) {
          return false;
        }
        const completedDate = new Date(task.completedAt);
        return completedDate <= currentDate;
      })
      .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

    const remaining = totalPoints - completedPoints;
    const ideal = Math.max(0, totalPoints - dailyIdealBurndown * day);

    burndownData.push({
      date: dateString,
      remaining,
      ideal: Math.round(ideal * 10) / 10, // Round to 1 decimal
      completed: completedPoints,
    });
  }

  return burndownData;
}

/**
 * Check if sprint is over capacity
 * @param sprint - The sprint
 * @param tasks - All tasks in the sprint
 * @returns True if total story points exceed capacity
 */
export function isOverCapacity(sprint: Sprint, tasks: Task[]): boolean {
  const totalPoints = tasks
    .filter((task) => task.storyPoints !== null)
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

  return totalPoints > sprint.capacity;
}

/**
 * Calculate scope creep (tasks added after sprint start)
 * @param sprint - The sprint
 * @param tasks - All tasks in the sprint
 * @returns Number of story points added after sprint started
 */
export function calculateScopeCreep(sprint: Sprint, tasks: Task[]): number {
  const sprintStart = new Date(sprint.startDate);

  return tasks
    .filter((task) => {
      const createdAt = new Date(task.createdAt);
      return createdAt > sprintStart && task.storyPoints !== null;
    })
    .reduce((sum, task) => sum + (task.storyPoints || 0), 0);
}

// ============================================================================
// TASK FILTERING & GROUPING UTILITIES
// ============================================================================

/**
 * Filter tasks by status
 * @param tasks - All tasks
 * @param status - Status to filter by
 * @returns Filtered tasks
 */
export function getTasksByStatus(tasks: Task[], status: TaskStatus): Task[] {
  return tasks.filter((task) => task.status === status);
}

/**
 * Group tasks by assignee
 * @param tasks - All tasks
 * @returns Map of assigneeId to tasks
 */
export function groupTasksByAssignee(tasks: Task[]): Record<string, Task[]> {
  return tasks.reduce((groups, task) => {
    const key = task.assigneeId?.toString() || "unassigned";
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(task);
    return groups;
  }, {} as Record<string, Task[]>);
}

/**
 * Group tasks by status
 * @param tasks - All tasks
 * @returns Map of status to tasks
 */
export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groups = {} as Record<TaskStatus, Task[]>;

  // Initialize all statuses with empty arrays
  TASK_STATUSES.forEach((status) => {
    groups[status] = [];
  });

  // Group tasks
  tasks.forEach((task) => {
    groups[task.status].push(task);
  });

  return groups;
}

/**
 * Calculate team workload metrics
 * @param tasks - All tasks
 * @param users - Map of userId to user data
 * @returns Workload metrics per user
 */
export function calculateTeamWorkload(
  tasks: Task[],
  users: Map<string, { name: string; avatarUrl: string | null }>
): TeamWorkload[] {
  const grouped = groupTasksByAssignee(tasks);

  return Object.entries(grouped)
    .filter(([userId]) => userId !== "unassigned")
    .map(([userId, userTasks]) => {
      const user = users.get(userId);
      const tasksByStatus = groupTasksByStatus(userTasks);

      return {
        userId,
        userName: user?.name || "Unknown User",
        userAvatar: user?.avatarUrl || null,
        totalTasks: userTasks.length,
        totalStoryPoints: userTasks.reduce(
          (sum, task) => sum + (task.storyPoints || 0),
          0
        ),
        tasksByStatus: Object.fromEntries(
          Object.entries(tasksByStatus).map(([status, tasks]) => [
            status,
            tasks.length,
          ])
        ) as Record<TaskStatus, number>,
      };
    });
}

// ============================================================================
// DISPLAY & FORMATTING UTILITIES
// ============================================================================

/**
 * Format story points for display
 * @param points - Story points value
 * @returns Formatted string
 */
export function formatStoryPoints(points: StoryPoint | null): string {
  if (points === null) {
    return "—";
  }
  return `${points} ${points === 1 ? "point" : "points"}`;
}

/**
 * Get status display color
 * @param status - Task status
 * @returns Tailwind color class
 */
export function getStatusColor(status: TaskStatus): string {
  const colorMap: Record<TaskStatus, string> = {
    backlog: "bg-slate-500",
    todo: "bg-slate-600",
    in_progress: "bg-blue-500",
    in_review: "bg-purple-500",
    in_testing: "bg-amber-500",
    blocked: "bg-red-500",
    cancelled: "bg-gray-500",
    done: "bg-green-500",
    archived: "bg-gray-400",
  };
  return colorMap[status] || "bg-gray-500";
}

/**
 * Get status display label
 * @param status - Task status
 * @returns Human-readable label
 */
export function getStatusLabel(status: TaskStatus): string {
  const labelMap: Record<TaskStatus, string> = {
    backlog: "Backlog",
    todo: "To Do",
    in_progress: "In Progress",
    in_review: "In Review",
    in_testing: "In Testing",
    blocked: "Blocked",
    cancelled: "Cancelled",
    done: "Done",
    archived: "Archived",
  };
  return labelMap[status] || status;
}

/**
 * Get priority display color
 * @param priority - Task priority
 * @returns Tailwind color class
 */
export function getPriorityColor(priority: TaskPriority): string {
  const colorMap: Record<TaskPriority, string> = {
    critical: "bg-red-600 text-white",
    high: "bg-amber-500 text-white",
    medium: "bg-blue-500 text-white",
    low: "bg-gray-500 text-white",
  };
  return colorMap[priority] || "bg-gray-500 text-white";
}

/**
 * Get priority display label
 * @param priority - Task priority
 * @returns Human-readable label
 */
export function getPriorityLabel(priority: TaskPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

/**
 * Get priority sort value (for sorting)
 * @param priority - Task priority
 * @returns Numeric value (higher = more important)
 */
export function getPrioritySortValue(priority: TaskPriority): number {
  const valueMap: Record<TaskPriority, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };
  return valueMap[priority] || 0;
}

// ============================================================================
// DATE & TIME UTILITIES
// ============================================================================

/**
 * Calculate average cycle time for completed tasks
 * @param tasks - Completed tasks
 * @returns Average days from todo → done, or null if no completed tasks
 */
export function calculateAverageCycleTime(tasks: Task[]): number | null {
  const completedTasks = tasks.filter(
    (task) => task.status === "done" && task.completedAt
  );

  if (completedTasks.length === 0) {
    return null;
  }

  const totalDays = completedTasks.reduce((sum, task) => {
    const created = new Date(task.createdAt);
    const completed = new Date(task.completedAt!);
    const days =
      (completed.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);

  return Math.round((totalDays / completedTasks.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Check if a date is overdue
 * @param dueDate - Due date
 * @returns True if overdue
 */
export function isOverdue(dueDate: Date | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date();
}

/**
 * Format date for display
 * @param date - Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format relative date (e.g., "2 days ago")
 * @param date - Date to format
 * @returns Relative date string
 */
export function formatRelativeDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate story points value
 * @param points - Story points to validate
 * @returns True if valid
 */
export function isValidStoryPoints(points: number | null): boolean {
  if (points === null) return true;
  return [1, 2, 3, 5, 8, 13, 21].includes(points);
}

/**
 * Validate sprint dates
 * @param startDate - Sprint start date
 * @param endDate - Sprint end date
 * @returns Error message if invalid, null if valid
 */
export function validateSprintDates(
  startDate: Date,
  endDate: Date
): string | null {
  if (endDate <= startDate) {
    return "End date must be after start date";
  }

  const duration =
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
  if (duration > 60) {
    return "Sprint duration cannot exceed 60 days";
  }

  return null;
}

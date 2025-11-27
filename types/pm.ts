import { ObjectId } from "mongodb";

// ============================================================================
// ENUMS AND LITERALS
// ============================================================================

export const TASK_TYPES = ["story", "task", "bug", "epic", "spike"] as const;
export type TaskType = (typeof TASK_TYPES)[number];

export const TASK_PRIORITIES = ["critical", "high", "medium", "low"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "in_testing",
  "blocked",
  "cancelled",
  "done",
  "archived",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STORY_POINTS = [1, 2, 3, 5, 8, 13, 21] as const;
export type StoryPoint = (typeof STORY_POINTS)[number];

export const SPRINT_STATUSES = [
  "planning",
  "active",
  "completed",
  "archived",
] as const;
export type SprintStatus = (typeof SPRINT_STATUSES)[number];

export const USER_ROLES = [
  "admin",
  "project_manager",
  "developer",
  "designer",
  "qa",
] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const ATTACHMENT_TYPES = ["image", "file", "link"] as const;
export type AttachmentType = (typeof ATTACHMENT_TYPES)[number];

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Task (Backlog Item)
 * Represents a single work item (story, task, bug, epic, or spike)
 */
export interface Task {
  _id: ObjectId;
  projectId: ObjectId;
  title: string;
  description: string; // Markdown
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  storyPoints: StoryPoint | null;
  assigneeId: string | null; // Reference to User (Clerk user ID)
  reporterId: string; // User who created the item (Clerk user ID)
  sprintId: ObjectId | null; // null = unassigned to sprint
  tags: ObjectId[]; // References to Tag documents
  acceptanceCriteria: AcceptanceCriterion[];
  attachments: Attachment[];
  parentId: ObjectId | null; // For epics/subtasks
  dependencies: ObjectId[]; // Tasks that block this one
  estimatedHours: number | null;
  actualHours: number | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}

/**
 * Acceptance Criterion for a Task
 */
export interface AcceptanceCriterion {
  id: string; // Client-side generated UUID
  text: string;
  completed: boolean;
}

/**
 * Attachment for a Task
 */
export interface Attachment {
  id: string; // Client-side generated UUID
  url: string;
  name: string;
  type: AttachmentType;
  uploadedAt: Date;
}

/**
 * Sprint
 * Time-boxed iteration for organizing and tracking work
 */
export interface Sprint {
  _id: ObjectId;
  projectId: ObjectId;
  name: string; // e.g., "Sprint 24"
  goal: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  capacity: number; // Total story points team can handle
  committedPoints: number; // Story points when sprint started
  completedPoints: number;
  retrospectiveNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Tag
 * Flexible labeling system for categorizing tasks
 */
export interface Tag {
  _id: ObjectId;
  projectId: ObjectId;
  name: string;
  color: string; // Hex color (e.g., "#FF0000")
  createdAt: Date;
}

/**
 * User (Integrated with Clerk)
 * Represents a team member
 * Primary key is Clerk user ID (string)
 */
export interface User {
  _id: string; // Clerk user ID (e.g., "user_2abc123")
  clerkId: string | null; // Same as _id for compatibility
  name: string;
  email: string;
  avatarUrl: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Comment
 * Comments on tasks for collaboration
 */
export interface Comment {
  _id: ObjectId;
  taskId: ObjectId;
  userId: string; // Clerk user ID
  content: string; // Markdown
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task History Entry
 * Audit log for task changes
 */
export interface TaskHistory {
  _id: ObjectId;
  taskId: ObjectId;
  userId: string; // Clerk user ID
  action: TaskHistoryAction;
  field: string | null; // Field that changed (null for creation/deletion)
  oldValue: any;
  newValue: any;
  timestamp: Date;
}

export const TASK_HISTORY_ACTIONS = [
  "created",
  "updated",
  "deleted",
  "moved",
  "assigned",
  "commented",
  "status_changed",
  "sprint_assigned",
  "sprint_removed",
] as const;
export type TaskHistoryAction = (typeof TASK_HISTORY_ACTIONS)[number];

// ============================================================================
// FILTER & QUERY TYPES
// ============================================================================

/**
 * Task Filters
 * Used for filtering tasks in queries
 */
export interface TaskFilters {
  projectId?: string;
  sprintId?: string | null; // null = unassigned tasks
  status?: TaskStatus | TaskStatus[];
  type?: TaskType | TaskType[];
  priority?: TaskPriority | TaskPriority[];
  assigneeId?: string | null; // null = unassigned tasks
  tags?: string[]; // Array of tag IDs
  search?: string; // Search in title and description
  parentId?: string | null; // For filtering subtasks
  dueDate?: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Sprint Filters
 * Used for filtering sprints in queries
 */
export interface SprintFilters {
  projectId?: string;
  status?: SprintStatus | SprintStatus[];
  startDate?: {
    from?: Date;
    to?: Date;
  };
}

/**
 * Pagination Parameters
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * API Response Wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    field?: string;
  };
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
  };
}

// ============================================================================
// FORM DATA TYPES
// ============================================================================

/**
 * Task Create/Update Form Data
 */
export interface TaskFormData {
  projectId: string;
  title: string;
  description: string;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  storyPoints: StoryPoint | null;
  assigneeId: string | null;
  reporterId: string;
  sprintId: string | null;
  tags: string[];
  acceptanceCriteria: AcceptanceCriterion[];
  attachments: Attachment[];
  parentId: string | null;
  dependencies: string[];
  estimatedHours: number | null;
  actualHours: number | null;
  dueDate: Date | null;
}

/**
 * Sprint Create/Update Form Data
 */
export interface SprintFormData {
  projectId: string;
  name: string;
  goal: string;
  startDate: Date;
  endDate: Date;
  status: SprintStatus;
  capacity: number;
  retrospectiveNotes?: string;
}

/**
 * Tag Create/Update Form Data
 */
export interface TagFormData {
  projectId: string;
  name: string;
  color: string;
}

/**
 * User Create/Update Form Data
 */
export interface UserFormData {
  name: string;
  email: string;
  avatarUrl?: string | null;
  role: UserRole;
  isActive?: boolean;
}

// ============================================================================
// METRICS & ANALYTICS TYPES
// ============================================================================

/**
 * Sprint Velocity Data
 */
export interface VelocityData {
  sprintId: string;
  sprintName: string;
  startDate: Date;
  endDate: Date;
  committedPoints: number;
  completedPoints: number;
  percentageCompleted: number;
}

/**
 * Burndown Chart Data Point
 */
export interface BurndownDataPoint {
  date: string; // ISO date string
  remaining: number; // Story points remaining
  ideal: number; // Ideal burndown value
  completed: number; // Story points completed so far
}

/**
 * Burndown Chart Data
 */
export interface BurndownData {
  sprintId: string;
  sprintName: string;
  startDate: Date;
  endDate: Date;
  totalPoints: number;
  dailyData: BurndownDataPoint[];
}

/**
 * Team Workload Data
 */
export interface TeamWorkload {
  userId: string;
  userName: string;
  userAvatar: string | null;
  totalTasks: number;
  totalStoryPoints: number;
  tasksByStatus: Record<TaskStatus, number>;
}

/**
 * Sprint Summary Metrics
 */
export interface SprintSummary {
  sprintId: string;
  sprintName: string;
  status: SprintStatus;
  startDate: Date;
  endDate: Date;
  capacity: number;
  committedPoints: number;
  completedPoints: number;
  percentageCompleted: number;
  daysRemaining: number;
  totalDays: number;
  tasksTotal: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByType: Record<TaskType, number>;
  isOverCapacity: boolean;
  scopeCreep: number; // Number of points added after sprint start
  averageCycleTime: number | null; // Average days from todo → done
}

/**
 * Project Summary Metrics
 */
export interface ProjectSummary {
  projectId: string;
  projectName: string;
  totalTasks: number;
  totalStoryPoints: number;
  tasksByStatus: Record<TaskStatus, number>;
  tasksByType: Record<TaskType, number>;
  tasksByPriority: Record<TaskPriority, number>;
  activeSprints: number;
  completedSprints: number;
  averageVelocity: number;
  bugRatio: number; // Percentage of bugs vs total tasks
  topTags: Array<{ tagId: string; tagName: string; count: number }>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Task with populated relationships
 */
export interface PopulatedTask extends Omit<Task, "assigneeId" | "reporterId"> {
  assignee: User | null;
  reporter: User;
  tagDetails: Tag[];
}

/**
 * Sprint with populated tasks
 */
export interface PopulatedSprint extends Sprint {
  tasks: Task[];
}

/**
 * Partial update types for PATCH operations
 */
export type TaskPartialUpdate = Partial<
  Pick<
    Task,
    | "title"
    | "description"
    | "type"
    | "priority"
    | "status"
    | "storyPoints"
    | "assigneeId"
    | "sprintId"
    | "tags"
    | "dueDate"
  >
>;

export type SprintPartialUpdate = Partial<
  Pick<Sprint, "name" | "goal" | "status" | "capacity" | "retrospectiveNotes">
>;

// ============================================================================
// RETROSPECTIVE TYPES
// ============================================================================

/**
 * Retrospective Format Templates
 */
export const RETROSPECTIVE_FORMATS = [
  "mad-sad-glad",
  "what-went-well",
  "start-stop-continue",
  "4ls",
] as const;
export type RetrospectiveFormat = (typeof RETROSPECTIVE_FORMATS)[number];

/**
 * Retrospective Session Phases
 */
export const RETROSPECTIVE_PHASES = [
  "setup",
  "collecting",
  "grouping",
  "voting",
  "discussing",
  "actions",
  "completed",
] as const;
export type RetrospectivePhase = (typeof RETROSPECTIVE_PHASES)[number];

/**
 * Retrospective Action Item Status
 */
export const RETROSPECTIVE_ACTION_STATUSES = [
  "todo",
  "in_progress",
  "done",
] as const;
export type RetrospectiveActionStatus =
  (typeof RETROSPECTIVE_ACTION_STATUSES)[number];

/**
 * Retrospective Column Types for Mad-Sad-Glad
 */
export const MAD_SAD_GLAD_COLUMNS = ["mad", "sad", "glad"] as const;
export type MadSadGladColumn = (typeof MAD_SAD_GLAD_COLUMNS)[number];

/**
 * Retrospective Column Types for What Went Well
 */
export const WHAT_WENT_WELL_COLUMNS = [
  "went-well",
  "improve",
  "ideas",
] as const;
export type WhatWentWellColumn = (typeof WHAT_WENT_WELL_COLUMNS)[number];

/**
 * Retrospective Column Types for Start-Stop-Continue
 */
export const START_STOP_CONTINUE_COLUMNS = [
  "start",
  "stop",
  "continue",
] as const;
export type StartStopContinueColumn =
  (typeof START_STOP_CONTINUE_COLUMNS)[number];

/**
 * Retrospective Column Types for 4 Ls
 */
export const FOUR_LS_COLUMNS = ["loved", "loathed", "learned", "longed"] as const;
export type FourLsColumn = (typeof FOUR_LS_COLUMNS)[number];

/**
 * Union of all column types
 */
export type RetrospectiveColumn =
  | MadSadGladColumn
  | WhatWentWellColumn
  | StartStopContinueColumn
  | FourLsColumn;

/**
 * Retrospective Session
 * Main session configuration and state
 */
export interface RetrospectiveSession {
  _id: ObjectId;
  sprintId: ObjectId;
  format: RetrospectiveFormat;
  phase: RetrospectivePhase;
  facilitatorId: string; // Clerk user ID
  settings: {
    allowAnonymous: boolean;
    votesPerPerson: number;
    timerMinutes: number | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Retrospective Card
 * Individual sticky note/card in a retrospective
 */
export interface RetrospectiveCard {
  _id: ObjectId;
  sessionId: ObjectId;
  sprintId: ObjectId;
  column: RetrospectiveColumn;
  content: string;
  authorId: string; // Clerk user ID
  isAnonymous: boolean;
  votes: string[]; // Array of Clerk user IDs who voted
  groupId: string | null; // For grouping similar cards
  groupTitle: string | null; // Title for the group
  order: number; // For ordering within column
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Retrospective Action Item
 * Action items created during retrospective
 */
export interface RetrospectiveActionItem {
  _id: ObjectId;
  sessionId: ObjectId;
  sprintId: ObjectId;
  title: string;
  description: string;
  assigneeId: string | null; // Clerk user ID
  status: RetrospectiveActionStatus;
  dueDate: Date | null;
  cardIds: ObjectId[]; // Related cards that led to this action
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Retrospective Session Form Data
 */
export interface RetrospectiveSessionFormData {
  sprintId: string;
  format: RetrospectiveFormat;
  facilitatorId: string;
  settings: {
    allowAnonymous: boolean;
    votesPerPerson: number;
    timerMinutes: number | null;
  };
}

/**
 * Retrospective Card Form Data
 */
export interface RetrospectiveCardFormData {
  sessionId: string;
  sprintId: string;
  column: RetrospectiveColumn;
  content: string;
  authorId: string;
  isAnonymous: boolean;
}

/**
 * Retrospective Action Item Form Data
 */
export interface RetrospectiveActionFormData {
  sessionId: string;
  sprintId: string;
  title: string;
  description: string;
  assigneeId: string | null;
  dueDate: Date | null;
  cardIds: string[];
}

/**
 * Retrospective Summary
 * Complete summary of a retrospective session
 */
export interface RetrospectiveSummary {
  session: RetrospectiveSession;
  cards: RetrospectiveCard[];
  actions: RetrospectiveActionItem[];
  stats: {
    totalCards: number;
    totalVotes: number;
    totalActions: number;
    participantCount: number;
    completedActions: number;
  };
}

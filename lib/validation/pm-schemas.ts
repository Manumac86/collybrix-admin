import { z } from "zod";
import {
  TASK_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  STORY_POINTS,
  SPRINT_STATUSES,
  USER_ROLES,
  ATTACHMENT_TYPES,
} from "@/types/pm";

// ============================================================================
// SHARED SCHEMAS
// ============================================================================

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid ObjectId format");

// User ID schema that accepts both MongoDB ObjectIds and Clerk user IDs
const userIdSchema = z.string().min(1, "User ID is required");

const acceptanceCriterionSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1, "Acceptance criterion cannot be empty"),
  completed: z.boolean(),
});

const attachmentSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url("Invalid URL"),
  name: z.string().min(1, "Attachment name is required"),
  type: z.enum(ATTACHMENT_TYPES),
  uploadedAt: z.coerce.date(),
});

// ============================================================================
// TASK SCHEMAS
// ============================================================================

/**
 * Schema for creating a new task
 */
export const taskCreateSchema = z.object({
  projectId: objectIdSchema,
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less"),
  description: z.string().default(""),
  type: z.enum(TASK_TYPES),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES).default("backlog"),
  storyPoints: z
    .enum(STORY_POINTS.map(String) as any)
    .transform((val) => Number(val))
    .nullable()
    .default(null),
  assigneeId: userIdSchema.nullable().default(null),
  reporterId: userIdSchema,
  sprintId: objectIdSchema.nullable().default(null),
  tags: z.array(objectIdSchema).default([]),
  acceptanceCriteria: z.array(acceptanceCriterionSchema).default([]),
  attachments: z.array(attachmentSchema).default([]),
  parentId: objectIdSchema.nullable().default(null),
  dependencies: z.array(objectIdSchema).default([]),
  estimatedHours: z
    .number()
    .positive("Estimated hours must be positive")
    .nullable()
    .default(null),
  actualHours: z
    .number()
    .positive("Actual hours must be positive")
    .nullable()
    .default(null),
  dueDate: z.coerce.date().nullable().default(null),
});

/**
 * Schema for updating an existing task
 */
export const taskUpdateSchema = taskCreateSchema.partial().extend({
  _id: objectIdSchema.optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
  completedAt: z.coerce.date().nullable().optional(),
});

/**
 * Schema for partial task updates (PATCH)
 */
export const taskPartialUpdateSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be 200 characters or less")
    .optional(),
  description: z.string().optional(),
  type: z.enum(TASK_TYPES).optional(),
  priority: z.enum(TASK_PRIORITIES).optional(),
  status: z.enum(TASK_STATUSES).optional(),
  storyPoints: z
    .enum(STORY_POINTS.map(String) as any)
    .transform((val) => Number(val))
    .nullable()
    .optional(),
  assigneeId: userIdSchema.nullable().optional(),
  sprintId: objectIdSchema.nullable().optional(),
  tags: z.array(objectIdSchema).optional(),
  acceptanceCriteria: z.array(acceptanceCriterionSchema).optional(),
  attachments: z.array(attachmentSchema).optional(),
  parentId: objectIdSchema.nullable().optional(),
  dependencies: z.array(objectIdSchema).optional(),
  estimatedHours: z
    .number()
    .positive("Estimated hours must be positive")
    .nullable()
    .optional(),
  actualHours: z
    .number()
    .positive("Actual hours must be positive")
    .nullable()
    .optional(),
  dueDate: z.coerce.date().nullable().optional(),
});

/**
 * Schema for moving a task (quick status/sprint change)
 */
export const taskMoveSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  sprintId: objectIdSchema.nullable().optional(),
});

// ============================================================================
// SPRINT SCHEMAS
// ============================================================================

/**
 * Base schema for sprint object (without refinements)
 */
const sprintBaseSchema = z.object({
  projectId: objectIdSchema,
  name: z
    .string()
    .min(1, "Sprint name is required")
    .max(100, "Sprint name must be 100 characters or less"),
  goal: z
    .string()
    .max(500, "Sprint goal must be 500 characters or less")
    .default(""),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(SPRINT_STATUSES).default("planning"),
  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be positive")
    .max(500, "Capacity seems unreasonably high")
    .default(0),
  committedPoints: z
    .number()
    .int("Committed points must be a whole number")
    .nonnegative("Committed points cannot be negative")
    .default(0),
  completedPoints: z
    .number()
    .int("Completed points must be a whole number")
    .nonnegative("Completed points cannot be negative")
    .default(0),
  retrospectiveNotes: z.string().default(""),
});

/**
 * Schema for creating a new sprint (with refinements)
 */
export const sprintCreateSchema = sprintBaseSchema
  .refine(
    (data) => {
      return data.endDate > data.startDate;
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      const duration =
        (data.endDate.getTime() - data.startDate.getTime()) /
        (1000 * 60 * 60 * 24);
      return duration <= 60;
    },
    {
      message: "Sprint duration cannot exceed 60 days",
      path: ["endDate"],
    }
  );

/**
 * Schema for updating an existing sprint
 */
export const sprintUpdateSchema = sprintBaseSchema.partial().extend({
  _id: objectIdSchema.optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

/**
 * Schema for partial sprint updates (PATCH)
 */
export const sprintPartialUpdateSchema = z.object({
  name: z
    .string()
    .min(1, "Sprint name is required")
    .max(100, "Sprint name must be 100 characters or less")
    .optional(),
  goal: z
    .string()
    .max(500, "Sprint goal must be 500 characters or less")
    .optional(),
  status: z.enum(SPRINT_STATUSES).optional(),
  capacity: z
    .number()
    .int("Capacity must be a whole number")
    .positive("Capacity must be positive")
    .max(500, "Capacity seems unreasonably high")
    .optional(),
  committedPoints: z
    .number()
    .int("Committed points must be a whole number")
    .nonnegative("Committed points cannot be negative")
    .optional(),
  completedPoints: z
    .number()
    .int("Completed points must be a whole number")
    .nonnegative("Completed points cannot be negative")
    .optional(),
  retrospectiveNotes: z.string().optional(),
});

// ============================================================================
// TAG SCHEMAS
// ============================================================================

/**
 * Schema for creating a new tag
 */
export const tagCreateSchema = z.object({
  projectId: objectIdSchema,
  name: z
    .string()
    .min(1, "Tag name is required")
    .max(50, "Tag name must be 50 characters or less")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Tag name contains invalid characters"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color format (use hex: #RRGGBB)"),
});

/**
 * Schema for updating an existing tag
 */
export const tagUpdateSchema = tagCreateSchema.partial().extend({
  _id: objectIdSchema.optional(),
  createdAt: z.coerce.date().optional(),
});

// ============================================================================
// USER SCHEMAS
// ============================================================================

/**
 * Schema for creating a new user (placeholder)
 */
export const userCreateSchema = z.object({
  clerkId: z.string().nullable().default(null),
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be 100 characters or less"),
  email: z.string().email("Invalid email address"),
  avatarUrl: z.string().url("Invalid avatar URL").nullable().default(null),
  role: z.enum(USER_ROLES).default("developer"),
  isActive: z.boolean().default(true),
});

/**
 * Schema for updating an existing user
 */
export const userUpdateSchema = userCreateSchema.partial().extend({
  _id: objectIdSchema.optional(),
  createdAt: z.coerce.date().optional(),
  updatedAt: z.coerce.date().optional(),
});

// ============================================================================
// COMMENT SCHEMAS
// ============================================================================

/**
 * Schema for creating a comment
 */
export const commentCreateSchema = z.object({
  taskId: objectIdSchema,
  userId: userIdSchema,
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment is too long"),
});

/**
 * Schema for updating a comment
 */
export const commentUpdateSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(5000, "Comment is too long"),
});

// ============================================================================
// QUERY PARAMETER SCHEMAS
// ============================================================================

/**
 * Schema for task query parameters
 */
export const taskQuerySchema = z.object({
  projectId: objectIdSchema.optional(),
  sprintId: z.union([objectIdSchema, z.literal("null")]).optional(),
  status: z
    .union([z.enum(TASK_STATUSES), z.array(z.enum(TASK_STATUSES))])
    .optional(),
  type: z
    .union([z.enum(TASK_TYPES), z.array(z.enum(TASK_TYPES))])
    .optional(),
  priority: z
    .union([z.enum(TASK_PRIORITIES), z.array(z.enum(TASK_PRIORITIES))])
    .optional(),
  assigneeId: z.union([userIdSchema, z.literal("null")]).optional(),
  tags: z.array(objectIdSchema).optional(),
  search: z.string().optional(),
  parentId: z.union([objectIdSchema, z.literal("null")]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema for sprint query parameters
 */
export const sprintQuerySchema = z.object({
  projectId: objectIdSchema.optional(),
  status: z
    .union([z.enum(SPRINT_STATUSES), z.array(z.enum(SPRINT_STATUSES))])
    .optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(50),
  sortBy: z.string().default("startDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type TaskCreateInput = z.infer<typeof taskCreateSchema>;
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>;
export type TaskPartialUpdateInput = z.infer<typeof taskPartialUpdateSchema>;
export type TaskMoveInput = z.infer<typeof taskMoveSchema>;

export type SprintCreateInput = z.infer<typeof sprintCreateSchema>;
export type SprintUpdateInput = z.infer<typeof sprintUpdateSchema>;
export type SprintPartialUpdateInput = z.infer<typeof sprintPartialUpdateSchema>;

export type TagCreateInput = z.infer<typeof tagCreateSchema>;
export type TagUpdateInput = z.infer<typeof tagUpdateSchema>;

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

export type CommentCreateInput = z.infer<typeof commentCreateSchema>;
export type CommentUpdateInput = z.infer<typeof commentUpdateSchema>;

export type TaskQueryParams = z.infer<typeof taskQuerySchema>;
export type SprintQueryParams = z.infer<typeof sprintQuerySchema>;

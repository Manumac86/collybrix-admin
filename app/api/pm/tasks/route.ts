import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { taskCreateSchema, taskQuerySchema } from "@/lib/validation/pm-schemas";
import { z } from "zod";

/**
 * GET /api/pm/tasks
 * Get all tasks with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const statusParams = searchParams.getAll("status");
    const typeParams = searchParams.getAll("type");
    const priorityParams = searchParams.getAll("priority");

    const queryParams = {
      projectId: searchParams.get("projectId") || undefined,
      sprintId: searchParams.get("sprintId") || undefined,
      status: statusParams.length > 0 ? (statusParams.length === 1 ? statusParams[0] : statusParams) : undefined,
      type: typeParams.length > 0 ? (typeParams.length === 1 ? typeParams[0] : typeParams) : undefined,
      priority: priorityParams.length > 0 ? (priorityParams.length === 1 ? priorityParams[0] : priorityParams) : undefined,
      assigneeId: searchParams.get("assigneeId") || undefined,
      search: searchParams.get("search") || undefined,
      parentId: searchParams.get("parentId") || undefined,
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || "50",
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const validated = taskQuerySchema.parse(queryParams);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tasksCollection = db.collection("tasks");

    // Build filter
    const filter: any = {};

    if (validated.projectId) {
      filter.projectId = new ObjectId(validated.projectId);
    }

    if (validated.sprintId !== undefined) {
      filter.sprintId =
        validated.sprintId === "null" ? null : new ObjectId(validated.sprintId);
    }

    if (validated.status) {
      filter.status = Array.isArray(validated.status)
        ? { $in: validated.status }
        : validated.status;
    }

    if (validated.type) {
      filter.type = Array.isArray(validated.type)
        ? { $in: validated.type }
        : validated.type;
    }

    if (validated.priority) {
      filter.priority = Array.isArray(validated.priority)
        ? { $in: validated.priority }
        : validated.priority;
    }

    // Support both old assigneeId (for backwards compatibility) and new assigneeIds
    if (validated.assigneeId !== undefined) {
      filter.assigneeId =
        validated.assigneeId === "null"
          ? null
          : validated.assigneeId; // Keep as string (Clerk user ID)
    }

    if (validated.assigneeIds && validated.assigneeIds.length > 0) {
      filter.assigneeIds = {
        $in: validated.assigneeIds,
      };
    }

    if (validated.parentId !== undefined) {
      filter.parentId =
        validated.parentId === "null" ? null : new ObjectId(validated.parentId);
    }

    if (validated.search) {
      filter.$or = [
        { title: { $regex: validated.search, $options: "i" } },
        { description: { $regex: validated.search, $options: "i" } },
      ];
    }

    if (validated.tags && validated.tags.length > 0) {
      filter.tags = {
        $in: validated.tags.map((id) => new ObjectId(id)),
      };
    }

    // Count total documents
    const total = await tasksCollection.countDocuments(filter);

    // Calculate pagination
    const skip = (validated.page - 1) * validated.pageSize;
    const sortOrder = validated.sortOrder === "asc" ? 1 : -1;

    // Fetch tasks
    const tasks = await tasksCollection
      .find(filter)
      .sort({ [validated.sortBy]: sortOrder })
      .skip(skip)
      .limit(validated.pageSize)
      .toArray();

    return NextResponse.json({
      success: true,
      data: tasks,
      meta: {
        total,
        page: validated.page,
        pageSize: validated.pageSize,
        totalPages: Math.ceil(total / validated.pageSize),
      },
    });
  } catch (error) {
    console.error("[ERROR] Error fetching tasks:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch tasks",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pm/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = taskCreateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tasksCollection = db.collection("tasks");

    // Prepare task document
    const taskDocument = {
      ...validated,
      projectId: new ObjectId(validated.projectId),
      assigneeId: validated.assigneeId || null, // DEPRECATED: For backwards compatibility
      assigneeIds: validated.assigneeIds || [], // Array of Clerk user IDs
      reporterId: validated.reporterId, // Keep as string (Clerk user ID)
      sprintId: validated.sprintId ? new ObjectId(validated.sprintId) : null,
      parentId: validated.parentId ? new ObjectId(validated.parentId) : null,
      tags: validated.tags.map((id) => new ObjectId(id)),
      dependencies: validated.dependencies.map((id) => new ObjectId(id)),
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };

    // Insert task
    const result = await tasksCollection.insertOne(taskDocument);

    // Fetch the created task
    const createdTask = await tasksCollection.findOne({ _id: result.insertedId });

    return NextResponse.json(
      {
        success: true,
        data: createdTask,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ERROR] Error creating task:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid task data",
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create task",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * MongoDB Indexes for tasks collection:
 *
 * db.tasks.createIndex({ projectId: 1, sprintId: 1 });
 * db.tasks.createIndex({ projectId: 1, status: 1 });
 * db.tasks.createIndex({ assigneeId: 1 });
 * db.tasks.createIndex({ createdAt: -1 });
 * db.tasks.createIndex({ status: 1, priority: -1 });
 * db.tasks.createIndex({ title: "text", description: "text" }); // Text search
 * db.tasks.createIndex({ tags: 1 });
 * db.tasks.createIndex({ parentId: 1 });
 */

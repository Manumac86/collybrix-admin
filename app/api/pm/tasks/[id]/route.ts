import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  taskUpdateSchema,
  taskPartialUpdateSchema,
} from "@/lib/validation/pm-schemas";
import { z } from "zod";

/**
 * GET /api/pm/tasks/[id]
 * Get a single task by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid task ID format",
          },
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tasksCollection = db.collection("tasks");

    // Find task
    const task = await tasksCollection.findOne({ _id: new ObjectId(id) });

    if (!task) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Task not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error("[ERROR] Error fetching task:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch task",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pm/tasks/[id]
 * Update a task (full update)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid task ID format",
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validated = taskUpdateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tasksCollection = db.collection("tasks");

    // Prepare update document
    const updateDoc: any = {
      ...validated,
      updatedAt: new Date(),
    };

    // Convert string IDs to ObjectIds
    if (validated.projectId) {
      updateDoc.projectId = new ObjectId(validated.projectId);
    }
    if (validated.assigneeId !== undefined) {
      updateDoc.assigneeId = validated.assigneeId; // DEPRECATED: Keep as string (Clerk user ID)
    }
    if (validated.assigneeIds !== undefined) {
      updateDoc.assigneeIds = validated.assigneeIds; // Array of Clerk user IDs
    }
    if (validated.reporterId) {
      updateDoc.reporterId = validated.reporterId; // Keep as string (Clerk user ID)
    }
    if (validated.sprintId !== undefined) {
      updateDoc.sprintId = validated.sprintId
        ? new ObjectId(validated.sprintId)
        : null;
    }
    if (validated.parentId !== undefined) {
      updateDoc.parentId = validated.parentId
        ? new ObjectId(validated.parentId)
        : null;
    }
    if (validated.tags) {
      updateDoc.tags = validated.tags.map((tagId) => new ObjectId(tagId));
    }
    if (validated.dependencies) {
      updateDoc.dependencies = validated.dependencies.map(
        (depId) => new ObjectId(depId)
      );
    }

    // If status changed to "done", set completedAt
    if (validated.status === "done") {
      updateDoc.completedAt = new Date();
    } else if (validated.status && validated.status !== "done") {
      updateDoc.completedAt = null;
    }

    // Get the task before update to check if sprintId or status changed
    const taskBefore = await tasksCollection.findOne({ _id: new ObjectId(id) });

    // Update task
    const result = await tasksCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Task not found",
          },
        },
        { status: 404 }
      );
    }

    // Update sprint completedPoints if task has a sprint and status/sprint changed
    const sprintsToUpdate = new Set<string>();
    if (taskBefore?.sprintId) {
      sprintsToUpdate.add(taskBefore.sprintId.toString());
    }
    if (result.sprintId) {
      sprintsToUpdate.add(result.sprintId.toString());
    }

    if (sprintsToUpdate.size > 0) {
      const sprintsCollection = db.collection("sprints");
      for (const sprintId of sprintsToUpdate) {
        // Calculate completed points for this sprint
        const sprintTasks = await tasksCollection
          .find({ sprintId: new ObjectId(sprintId) })
          .toArray();

        const completedPoints = sprintTasks
          .filter((task) => task.status === "done" && task.storyPoints !== null)
          .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

        // Update sprint
        await sprintsCollection.updateOne(
          { _id: new ObjectId(sprintId) },
          { $set: { completedPoints, updatedAt: new Date() } }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[ERROR] Error updating task:", error);

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
          message: "Failed to update task",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pm/tasks/[id]
 * Partial update of a task (for drag-and-drop, quick status changes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid task ID format",
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validated = taskPartialUpdateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tasksCollection = db.collection("tasks");

    // Prepare update document
    const updateDoc: any = {
      ...validated,
      updatedAt: new Date(),
    };

    // Convert string IDs to ObjectIds where applicable
    if (validated.assigneeId !== undefined) {
      updateDoc.assigneeId = validated.assigneeId; // Keep as string (Clerk user ID)
    }
    if (validated.sprintId !== undefined) {
      updateDoc.sprintId = validated.sprintId
        ? new ObjectId(validated.sprintId)
        : null;
    }
    if (validated.parentId !== undefined) {
      updateDoc.parentId = validated.parentId
        ? new ObjectId(validated.parentId)
        : null;
    }
    if (validated.tags) {
      updateDoc.tags = validated.tags.map((tagId) => new ObjectId(tagId));
    }
    if (validated.dependencies) {
      updateDoc.dependencies = validated.dependencies.map(
        (depId) => new ObjectId(depId)
      );
    }

    // If status changed to "done", set completedAt
    if (validated.status === "done") {
      updateDoc.completedAt = new Date();
    } else if (validated.status && validated.status !== "done") {
      updateDoc.completedAt = null;
    }

    // Get the task before update to check if sprintId or status changed
    const taskBefore = await tasksCollection.findOne({ _id: new ObjectId(id) });

    // Update task
    const result = await tasksCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Task not found",
          },
        },
        { status: 404 }
      );
    }

    // Update sprint completedPoints if task has a sprint and status/sprint changed
    const sprintsToUpdate = new Set<string>();
    if (taskBefore?.sprintId) {
      sprintsToUpdate.add(taskBefore.sprintId.toString());
    }
    if (result.sprintId) {
      sprintsToUpdate.add(result.sprintId.toString());
    }

    if (sprintsToUpdate.size > 0) {
      const sprintsCollection = db.collection("sprints");
      for (const sprintId of sprintsToUpdate) {
        // Calculate completed points for this sprint
        const sprintTasks = await tasksCollection
          .find({ sprintId: new ObjectId(sprintId) })
          .toArray();

        const completedPoints = sprintTasks
          .filter((task) => task.status === "done" && task.storyPoints !== null)
          .reduce((sum, task) => sum + (task.storyPoints || 0), 0);

        // Update sprint
        await sprintsCollection.updateOne(
          { _id: new ObjectId(sprintId) },
          { $set: { completedPoints, updatedAt: new Date() } }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[ERROR] Error patching task:", error);

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
          message: "Failed to patch task",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pm/tasks/[id]
 * Soft delete a task (mark as archived)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid task ID format",
          },
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tasksCollection = db.collection("tasks");

    // Soft delete: mark as archived instead of hard delete
    const result = await tasksCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          status: "archived",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Task not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: "Task archived successfully",
    });
  } catch (error) {
    console.error("[ERROR] Error deleting task:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete task",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

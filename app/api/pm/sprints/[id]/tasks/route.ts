import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET /api/pm/sprints/[id]/tasks
 * Get all tasks in a specific sprint
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
            message: "Invalid sprint ID format",
          },
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tasksCollection = db.collection("tasks");
    const sprintsCollection = db.collection("sprints");

    // Verify sprint exists
    const sprint = await sprintsCollection.findOne({ _id: new ObjectId(id) });
    if (!sprint) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Sprint not found",
          },
        },
        { status: 404 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const assigneeId = searchParams.get("assigneeId");

    // Build filter
    const filter: any = {
      sprintId: new ObjectId(id),
    };

    if (status) {
      filter.status = status;
    }

    if (assigneeId) {
      filter.assigneeId =
        assigneeId === "null" ? null : assigneeId; // Keep as string (Clerk user ID)
    }

    // Fetch tasks
    const tasks = await tasksCollection
      .find(filter)
      .sort({ status: 1, priority: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        sprint,
        tasks,
      },
      meta: {
        sprintId: id,
        totalTasks: tasks.length,
      },
    });
  } catch (error) {
    console.error("[ERROR] Error fetching sprint tasks:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch sprint tasks",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

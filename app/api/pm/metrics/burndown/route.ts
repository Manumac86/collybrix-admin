import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { getBurndownData } from "@/lib/pm-utils";
import { Task, Sprint } from "@/types/pm";

/**
 * GET /api/pm/metrics/burndown?sprintId={id}
 * Get burndown chart data for a specific sprint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sprintId = searchParams.get("sprintId");

    if (!sprintId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "sprintId query parameter is required",
          },
        },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(sprintId)) {
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
    const sprintsCollection = db.collection("sprints");
    const tasksCollection = db.collection("tasks");

    // Fetch sprint
    const sprint = (await sprintsCollection.findOne({
      _id: new ObjectId(sprintId),
    })) as unknown as Sprint | null;

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

    // Fetch tasks in sprint
    const tasks = (await tasksCollection
      .find({ sprintId: new ObjectId(sprintId) })
      .toArray()) as unknown as Task[];

    // Generate burndown data
    const burndownData = getBurndownData(sprint, tasks);

    return NextResponse.json({
      success: true,
      data: burndownData,
    });
  } catch (error) {
    console.error("[ERROR] Error generating burndown data:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate burndown data",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { calculateSprintVelocity } from "@/lib/pm-utils";
import { Task, Sprint, VelocityData } from "@/types/pm";

/**
 * GET /api/pm/metrics/velocity?projectId={id}&sprintCount={count}
 * Get velocity data for recent sprints
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const sprintCount = parseInt(searchParams.get("sprintCount") || "6", 10);

    if (!projectId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_PARAMETER",
            message: "projectId query parameter is required",
          },
        },
        { status: 400 }
      );
    }

    // Validate ObjectId
    if (!ObjectId.isValid(projectId)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid project ID format",
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

    // Fetch recent completed sprints
    const sprints = (await sprintsCollection
      .find({
        projectId: new ObjectId(projectId),
        status: "completed",
      })
      .sort({ endDate: -1 })
      .limit(sprintCount)
      .toArray()) as unknown as Sprint[];

    // Calculate velocity for each sprint
    const velocityData: VelocityData[] = await Promise.all(
      sprints.map(async (sprint) => {
        const tasks = (await tasksCollection
          .find({ sprintId: sprint._id })
          .toArray()) as unknown as Task[];

        const completedPoints = calculateSprintVelocity(tasks);
        const committedPoints = sprint.committedPoints || 0;

        return {
          sprintId: sprint._id.toString(),
          sprintName: sprint.name,
          startDate: sprint.startDate,
          endDate: sprint.endDate,
          committedPoints,
          completedPoints,
          percentageCompleted:
            committedPoints > 0
              ? Math.round((completedPoints / committedPoints) * 100)
              : 0,
        };
      })
    );

    // Calculate average velocity
    const averageVelocity =
      velocityData.length > 0
        ? Math.round(
            velocityData.reduce((sum, d) => sum + d.completedPoints, 0) /
              velocityData.length
          )
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        velocityData: velocityData.reverse(), // Oldest to newest
        averageVelocity,
        sprintCount: velocityData.length,
      },
    });
  } catch (error) {
    console.error("[ERROR] Error generating velocity data:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate velocity data",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

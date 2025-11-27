import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { retrospectiveActionCreateSchema } from "@/lib/validation/pm-schemas";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/pm/sprints/[id]/retrospective/actions
 * Create a new retrospective action item
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: sprintId } = await params;
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("collybrix");
    const sessionsCollection = db.collection("retrospective_sessions");
    const actionsCollection = db.collection("retrospective_actions");

    // Find session for this sprint
    const session = await sessionsCollection.findOne({
      sprintId: new ObjectId(sprintId),
    });

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Retrospective session not found",
          },
        },
        { status: 404 }
      );
    }

    // Validate request body
    const validated = retrospectiveActionCreateSchema.parse({
      ...body,
      sessionId: session._id.toString(),
      sprintId,
    });

    // Create action document
    const actionDocument = {
      sessionId: session._id,
      sprintId: new ObjectId(validated.sprintId),
      title: validated.title,
      description: validated.description,
      assigneeId: validated.assigneeId,
      status: "todo" as const,
      dueDate: validated.dueDate,
      cardIds: validated.cardIds.map((id) => new ObjectId(id)),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert action
    const result = await actionsCollection.insertOne(actionDocument);

    // Fetch the created action
    const createdAction = await actionsCollection.findOne({
      _id: result.insertedId,
    });

    return NextResponse.json(
      {
        success: true,
        data: createdAction,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ERROR] Create retrospective action error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid action data",
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
          message: "Failed to create action",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

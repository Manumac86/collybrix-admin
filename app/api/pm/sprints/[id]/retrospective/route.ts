import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import {
  retrospectiveSessionCreateSchema,
  retrospectiveSessionUpdateSchema,
} from "@/lib/validation/pm-schemas";
import { auth } from "@clerk/nextjs/server";

/**
 * GET /api/pm/sprints/[id]/retrospective
 * Get retrospective session for a sprint
 */
export async function GET(
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

    const client = await clientPromise;
    const db = client.db("collybrix");
    const sessionsCollection = db.collection("retrospective_sessions");
    const cardsCollection = db.collection("retrospective_cards");
    const actionsCollection = db.collection("retrospective_actions");

    // Find session for this sprint
    const session = await sessionsCollection.findOne({
      sprintId: new ObjectId(sprintId),
    });

    if (!session) {
      return NextResponse.json(
        {
          success: true,
          data: null,
        },
        { status: 200 }
      );
    }

    // Get all cards for this session
    const cards = await cardsCollection
      .find({ sessionId: session._id })
      .sort({ column: 1, order: 1 })
      .toArray();

    // Get all action items for this session
    const actions = await actionsCollection
      .find({ sessionId: session._id })
      .sort({ createdAt: -1 })
      .toArray();

    // Calculate stats
    const participantIds = new Set(cards.map((card) => card.authorId));
    const totalVotes = cards.reduce(
      (sum, card) => sum + (card.votes?.length || 0),
      0
    );
    const completedActions = actions.filter((a) => a.status === "done").length;

    const summary = {
      session,
      cards,
      actions,
      stats: {
        totalCards: cards.length,
        totalVotes,
        totalActions: actions.length,
        participantCount: participantIds.size,
        completedActions,
      },
    };

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("[ERROR] Get retrospective session error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch retrospective session",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pm/sprints/[id]/retrospective
 * Create a new retrospective session for a sprint
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

    // Validate request body
    const validated = retrospectiveSessionCreateSchema.parse({
      ...body,
      sprintId,
      facilitatorId: userId,
    });

    const client = await clientPromise;
    const db = client.db("collybrix");
    const collection = db.collection("retrospective_sessions");

    // Check if session already exists for this sprint
    const existingSession = await collection.findOne({
      sprintId: new ObjectId(validated.sprintId),
    });

    if (existingSession) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONFLICT",
            message: "Retrospective session already exists for this sprint",
          },
        },
        { status: 409 }
      );
    }

    // Create session document
    const sessionDocument = {
      sprintId: new ObjectId(validated.sprintId),
      format: validated.format,
      phase: "setup" as const,
      facilitatorId: validated.facilitatorId,
      settings: validated.settings,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert session
    const result = await collection.insertOne(sessionDocument);

    // Fetch the created session
    const createdSession = await collection.findOne({ _id: result.insertedId });

    return NextResponse.json(
      {
        success: true,
        data: createdSession,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ERROR] Create retrospective session error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid retrospective session data",
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
          message: "Failed to create retrospective session",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pm/sprints/[id]/retrospective
 * Update retrospective session (phase, settings)
 */
export async function PATCH(
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

    // Validate request body
    const validated = retrospectiveSessionUpdateSchema.parse(body);

    const client = await clientPromise;
    const db = client.db("collybrix");
    const collection = db.collection("retrospective_sessions");

    // Find session
    const session = await collection.findOne({
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

    // Only facilitator can update session
    if (session.facilitatorId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only the facilitator can update the session",
          },
        },
        { status: 403 }
      );
    }

    // Prepare update document
    const updateDoc: any = {
      updatedAt: new Date(),
    };

    if (validated.phase) {
      updateDoc.phase = validated.phase;
    }

    if (validated.settings) {
      updateDoc.settings = {
        ...session.settings,
        ...validated.settings,
      };
    }

    // Update session
    const result = await collection.findOneAndUpdate(
      { _id: session._id },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[ERROR] Update retrospective session error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid update data",
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
          message: "Failed to update retrospective session",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pm/sprints/[id]/retrospective
 * Delete retrospective session and all related data
 */
export async function DELETE(
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

    const client = await clientPromise;
    const db = client.db("collybrix");
    const sessionsCollection = db.collection("retrospective_sessions");
    const cardsCollection = db.collection("retrospective_cards");
    const actionsCollection = db.collection("retrospective_actions");

    // Find session
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

    // Only facilitator can delete session
    if (session.facilitatorId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only the facilitator can delete the session",
          },
        },
        { status: 403 }
      );
    }

    // Delete all related cards and actions
    await cardsCollection.deleteMany({ sessionId: session._id });
    await actionsCollection.deleteMany({ sessionId: session._id });

    // Delete session
    await sessionsCollection.deleteOne({ _id: session._id });

    return NextResponse.json({
      success: true,
      data: { message: "Retrospective session deleted successfully" },
    });
  } catch (error) {
    console.error("[ERROR] Delete retrospective session error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete retrospective session",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

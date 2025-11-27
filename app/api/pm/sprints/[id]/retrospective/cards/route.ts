import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import {
  retrospectiveCardCreateSchema,
  retrospectiveCardUpdateSchema,
  retrospectiveCardVoteSchema,
} from "@/lib/validation/pm-schemas";
import { auth } from "@clerk/nextjs/server";

/**
 * POST /api/pm/sprints/[id]/retrospective/cards
 * Create a new retrospective card
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
    const cardsCollection = db.collection("retrospective_cards");

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
    const validated = retrospectiveCardCreateSchema.parse({
      ...body,
      sessionId: session._id.toString(),
      sprintId,
      authorId: userId,
    });

    // Get current max order for this column
    const maxOrderCard = await cardsCollection.findOne(
      {
        sessionId: session._id,
        column: validated.column,
      },
      {
        sort: { order: -1 },
        projection: { order: 1 },
      }
    );

    const nextOrder = (maxOrderCard?.order ?? -1) + 1;

    // Create card document
    const cardDocument = {
      sessionId: session._id,
      sprintId: new ObjectId(validated.sprintId),
      column: validated.column,
      content: validated.content,
      authorId: validated.authorId,
      isAnonymous: validated.isAnonymous,
      votes: [],
      groupId: null,
      groupTitle: null,
      order: nextOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert card
    const result = await cardsCollection.insertOne(cardDocument);

    // Fetch the created card
    const createdCard = await cardsCollection.findOne({ _id: result.insertedId });

    return NextResponse.json(
      {
        success: true,
        data: createdCard,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[ERROR] Create retrospective card error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid card data",
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
          message: "Failed to create card",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

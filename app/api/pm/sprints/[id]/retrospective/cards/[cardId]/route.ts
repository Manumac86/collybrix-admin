import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import {
  retrospectiveCardUpdateSchema,
  retrospectiveCardVoteSchema,
} from "@/lib/validation/pm-schemas";
import { auth } from "@clerk/nextjs/server";

/**
 * PATCH /api/pm/sprints/[id]/retrospective/cards/[cardId]
 * Update or vote on a retrospective card
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: sprintId, cardId } = await params;
    const body = await request.json();

    const client = await clientPromise;
    const db = client.db("collybrix");
    const cardsCollection = db.collection("retrospective_cards");

    // Find card
    const card = await cardsCollection.findOne({
      _id: new ObjectId(cardId),
      sprintId: new ObjectId(sprintId),
    });

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Card not found",
          },
        },
        { status: 404 }
      );
    }

    // Check if this is a vote action
    if (body.action === "add" || body.action === "remove") {
      const validated = retrospectiveCardVoteSchema.parse({
        userId,
        action: body.action,
      });

      let result;

      if (validated.action === "add") {
        // Add vote (avoid duplicates)
        result = await cardsCollection.findOneAndUpdate(
          { _id: card._id },
          {
            $addToSet: { votes: validated.userId },
            $set: { updatedAt: new Date() },
          },
          { returnDocument: "after" }
        );
      } else {
        // Remove vote
        result = await cardsCollection.findOneAndUpdate(
          { _id: card._id },
          {
            $pull: { votes: validated.userId },
            $set: { updatedAt: new Date() },
          },
          { returnDocument: "after" }
        );
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    }

    // Regular update
    const validated = retrospectiveCardUpdateSchema.parse(body);

    // Only author can edit content (unless anonymous)
    if (validated.content && card.authorId !== userId && !card.isAnonymous) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only the author can edit this card",
          },
        },
        { status: 403 }
      );
    }

    // Prepare update document
    const updateDoc: any = {
      updatedAt: new Date(),
    };

    if (validated.content !== undefined) {
      updateDoc.content = validated.content;
    }
    if (validated.groupId !== undefined) {
      updateDoc.groupId = validated.groupId;
    }
    if (validated.groupTitle !== undefined) {
      updateDoc.groupTitle = validated.groupTitle;
    }
    if (validated.order !== undefined) {
      updateDoc.order = validated.order;
    }

    // Update card
    const result = await cardsCollection.findOneAndUpdate(
      { _id: card._id },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[ERROR] Update card error:", error);

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
          message: "Failed to update card",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pm/sprints/[id]/retrospective/cards/[cardId]
 * Delete a retrospective card
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; cardId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: sprintId, cardId } = await params;

    const client = await clientPromise;
    const db = client.db("collybrix");
    const cardsCollection = db.collection("retrospective_cards");

    // Find card
    const card = await cardsCollection.findOne({
      _id: new ObjectId(cardId),
      sprintId: new ObjectId(sprintId),
    });

    if (!card) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Card not found",
          },
        },
        { status: 404 }
      );
    }

    // Only author can delete (unless anonymous, then anyone can delete)
    if (card.authorId !== userId && !card.isAnonymous) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Only the author can delete this card",
          },
        },
        { status: 403 }
      );
    }

    // Delete card
    await cardsCollection.deleteOne({ _id: card._id });

    return NextResponse.json({
      success: true,
      data: { message: "Card deleted successfully" },
    });
  } catch (error) {
    console.error("[ERROR] Delete card error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete card",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

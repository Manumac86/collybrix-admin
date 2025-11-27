import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { retrospectiveActionUpdateSchema } from "@/lib/validation/pm-schemas";
import { auth } from "@clerk/nextjs/server";

/**
 * PATCH /api/pm/sprints/[id]/retrospective/actions/[actionId]
 * Update a retrospective action item
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: sprintId, actionId } = await params;
    const body = await request.json();

    // Validate request body
    const validated = retrospectiveActionUpdateSchema.parse(body);

    const client = await clientPromise;
    const db = client.db("collybrix");
    const actionsCollection = db.collection("retrospective_actions");

    // Find action
    const action = await actionsCollection.findOne({
      _id: new ObjectId(actionId),
      sprintId: new ObjectId(sprintId),
    });

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Action item not found",
          },
        },
        { status: 404 }
      );
    }

    // Prepare update document
    const updateDoc: any = {
      updatedAt: new Date(),
    };

    if (validated.title !== undefined) {
      updateDoc.title = validated.title;
    }
    if (validated.description !== undefined) {
      updateDoc.description = validated.description;
    }
    if (validated.assigneeId !== undefined) {
      updateDoc.assigneeId = validated.assigneeId;
    }
    if (validated.status !== undefined) {
      updateDoc.status = validated.status;
    }
    if (validated.dueDate !== undefined) {
      updateDoc.dueDate = validated.dueDate;
    }
    if (validated.cardIds !== undefined) {
      updateDoc.cardIds = validated.cardIds.map((id) => new ObjectId(id));
    }

    // Update action
    const result = await actionsCollection.findOneAndUpdate(
      { _id: action._id },
      { $set: updateDoc },
      { returnDocument: "after" }
    );

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error("[ERROR] Update action error:", error);

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
          message: "Failed to update action",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pm/sprints/[id]/retrospective/actions/[actionId]
 * Delete a retrospective action item
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; actionId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id: sprintId, actionId } = await params;

    const client = await clientPromise;
    const db = client.db("collybrix");
    const actionsCollection = db.collection("retrospective_actions");

    // Find action
    const action = await actionsCollection.findOne({
      _id: new ObjectId(actionId),
      sprintId: new ObjectId(sprintId),
    });

    if (!action) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Action item not found",
          },
        },
        { status: 404 }
      );
    }

    // Delete action
    await actionsCollection.deleteOne({ _id: action._id });

    return NextResponse.json({
      success: true,
      data: { message: "Action item deleted successfully" },
    });
  } catch (error) {
    console.error("[ERROR] Delete action error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete action",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

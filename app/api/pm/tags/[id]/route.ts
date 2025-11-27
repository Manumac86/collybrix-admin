import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { tagUpdateSchema } from "@/lib/validation/pm-schemas";
import { z } from "zod";

/**
 * GET /api/pm/tags/[id]
 * Get a single tag by ID
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
            message: "Invalid tag ID format",
          },
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tagsCollection = db.collection("tags");

    // Find tag
    const tag = await tagsCollection.findOne({ _id: new ObjectId(id) });

    if (!tag) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Tag not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    console.error("[ERROR] Error fetching tag:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch tag",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pm/tags/[id]
 * Update a tag
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
            message: "Invalid tag ID format",
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validated = tagUpdateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tagsCollection = db.collection("tags");

    // If name is being updated, check for duplicates
    if (validated.name) {
      const existingTag = await tagsCollection.findOne({
        _id: { $ne: new ObjectId(id) },
        projectId: validated.projectId
          ? new ObjectId(validated.projectId)
          : undefined,
        name: { $regex: new RegExp(`^${validated.name}$`, "i") },
      });

      if (existingTag) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "DUPLICATE_TAG",
              message: "A tag with this name already exists in the project",
              field: "name",
            },
          },
          { status: 409 }
        );
      }
    }

    // Prepare update document
    const updateDoc: any = { ...validated };

    if (validated.projectId) {
      updateDoc.projectId = new ObjectId(validated.projectId);
    }

    // Update tag
    const result = await tagsCollection.findOneAndUpdate(
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
            message: "Tag not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("[ERROR] Error updating tag:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid tag data",
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
          message: "Failed to update tag",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pm/tags/[id]
 * Delete a tag (hard delete - also remove from all tasks)
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
            message: "Invalid tag ID format",
          },
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tagsCollection = db.collection("tags");
    const tasksCollection = db.collection("tasks");

    // Delete tag
    const result = await tagsCollection.findOneAndDelete({
      _id: new ObjectId(id),
    });

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Tag not found",
          },
        },
        { status: 404 }
      );
    }

    // Remove tag from all tasks
    await tasksCollection.updateMany(
      { tags: new ObjectId(id) },
      { $pull: { tags: new ObjectId(id) } }
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    console.error("[ERROR] Error deleting tag:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete tag",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

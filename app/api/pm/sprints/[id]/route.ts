import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  sprintUpdateSchema,
  sprintPartialUpdateSchema,
} from "@/lib/validation/pm-schemas";
import { z } from "zod";

/**
 * GET /api/pm/sprints/[id]
 * Get a single sprint by ID
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
    const sprintsCollection = db.collection("sprints");

    // Find sprint
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

    return NextResponse.json({
      success: true,
      data: sprint,
    });
  } catch (error) {
    console.error("[ERROR] Error fetching sprint:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch sprint",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pm/sprints/[id]
 * Update a sprint (full update)
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
            message: "Invalid sprint ID format",
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validated = sprintUpdateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const sprintsCollection = db.collection("sprints");

    // Prepare update document
    const updateDoc: any = {
      ...validated,
      updatedAt: new Date(),
    };

    // Convert string ID to ObjectId
    if (validated.projectId) {
      updateDoc.projectId = new ObjectId(validated.projectId);
    }

    // Update sprint
    const result = await sprintsCollection.findOneAndUpdate(
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
            message: "Sprint not found",
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
    console.error("[ERROR] Error updating sprint:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sprint data",
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
          message: "Failed to update sprint",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pm/sprints/[id]
 * Partial update of a sprint
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
            message: "Invalid sprint ID format",
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validated = sprintPartialUpdateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const sprintsCollection = db.collection("sprints");

    // Prepare update document
    const updateDoc: any = {
      ...validated,
      updatedAt: new Date(),
    };

    // Update sprint
    const result = await sprintsCollection.findOneAndUpdate(
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
            message: "Sprint not found",
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
    console.error("[ERROR] Error patching sprint:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid sprint data",
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
          message: "Failed to patch sprint",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/pm/sprints/[id]
 * Delete a sprint (soft delete - mark as archived)
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

    // Soft delete: mark as archived
    const result = await sprintsCollection.findOneAndUpdate(
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
            message: "Sprint not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: "Sprint archived successfully",
    });
  } catch (error) {
    console.error("[ERROR] Error deleting sprint:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete sprint",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

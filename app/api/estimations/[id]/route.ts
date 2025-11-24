import { type NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[v0] Fetching estimation:", id);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid estimation ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("collybrix");

    const estimation = await db
      .collection("estimations")
      .findOne({ _id: new ObjectId(id) });

    if (!estimation) {
      return NextResponse.json(
        { error: "Estimation not found" },
        { status: 404 }
      );
    }

    console.log("[v0] Successfully fetched estimation:", id);
    return NextResponse.json(estimation);
  } catch (error) {
    console.error("[v0] Error fetching estimation:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch estimation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log("[v0] Updating estimation:", id);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid estimation ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("collybrix");

    // Validate required fields
    if (!body.projectName || !body.clientName) {
      return NextResponse.json(
        { error: "Project name and client name are required" },
        { status: 400 }
      );
    }

    if (!body.teamMembers || body.teamMembers.length === 0) {
      return NextResponse.json(
        { error: "At least one team member is required" },
        { status: 400 }
      );
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Remove _id from update data if present
    delete updateData._id;

    const result = await db
      .collection("estimations")
      .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Estimation not found" },
        { status: 404 }
      );
    }

    console.log("[v0] Successfully updated estimation:", id);
    return NextResponse.json({ id, ...updateData });
  } catch (error) {
    console.error("[v0] Error updating estimation:", error);
    return NextResponse.json(
      {
        error: "Failed to update estimation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    console.log("[v0] Deleting estimation:", id);

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid estimation ID" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("collybrix");

    const result = await db
      .collection("estimations")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Estimation not found" },
        { status: 404 }
      );
    }

    console.log("[v0] Successfully deleted estimation:", id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[v0] Error deleting estimation:", error);
    return NextResponse.json(
      {
        error: "Failed to delete estimation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const client = await clientPromise;
    const db = client.db("collybrix");
    const project = await db
      .collection("projects")
      .findOne({ _id: new ObjectId(id) });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(project);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch project" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const client = await clientPromise;
    const db = client.db("collybrix");

    const result = await db.collection("projects").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...body,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    console.log(result);

    if (!result) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to update project",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("collybrix");

    const result = await db
      .collection("projects")
      .deleteOne({ _id: new ObjectId(id) });

    if (result?.deletedCount === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}

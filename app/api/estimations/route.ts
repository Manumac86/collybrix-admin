import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    console.log("[v0] Attempting to connect to MongoDB for estimations...");
    const client = await clientPromise;
    console.log("[v0] Connected to MongoDB client");

    const db = client.db("collybrix");
    console.log("[v0] Connected to collybrix database");

    const estimations = await db.collection("estimations").find({}).toArray();
    console.log("[v0] Successfully fetched estimations:", estimations.length);

    return NextResponse.json(estimations);
  } catch (error) {
    console.error("[v0] Error fetching estimations:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch estimations",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Creating new estimation...");
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

    const estimation = {
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("estimations").insertOne(estimation);
    console.log("[v0] Successfully created estimation:", result.insertedId);

    return NextResponse.json(
      { id: result.insertedId, ...estimation },
      { status: 201 }
    );
  } catch (error) {
    console.error("[v0] Error creating estimation:", error);
    return NextResponse.json(
      {
        error: "Failed to create estimation",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

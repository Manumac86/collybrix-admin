import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { tagCreateSchema } from "@/lib/validation/pm-schemas";
import { z } from "zod";

/**
 * GET /api/pm/tags
 * Get all tags with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tagsCollection = db.collection("tags");

    // Build filter
    const filter: any = {};

    if (projectId) {
      if (!ObjectId.isValid(projectId)) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_ID",
              message: "Invalid project ID format",
            },
          },
          { status: 400 }
        );
      }
      filter.projectId = new ObjectId(projectId);
    }

    // Fetch tags
    const tags = await tagsCollection
      .find(filter)
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: tags,
      meta: {
        total: tags.length,
      },
    });
  } catch (error) {
    console.error("[ERROR] Error fetching tags:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch tags",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pm/tags
 * Create a new tag
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = tagCreateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tagsCollection = db.collection("tags");

    // Check if tag with same name already exists in project
    const existingTag = await tagsCollection.findOne({
      projectId: new ObjectId(validated.projectId),
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

    // Prepare tag document
    const tagDocument = {
      ...validated,
      projectId: new ObjectId(validated.projectId),
      createdAt: new Date(),
    };

    // Insert tag
    const result = await tagsCollection.insertOne(tagDocument);

    // Fetch the created tag
    const createdTag = await tagsCollection.findOne({ _id: result.insertedId });

    return NextResponse.json(
      {
        success: true,
        data: createdTag,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ERROR] Error creating tag:", error);

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
          message: "Failed to create tag",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * MongoDB Indexes for tags collection:
 *
 * db.tags.createIndex({ projectId: 1 });
 * db.tags.createIndex({ projectId: 1, name: 1 }, { unique: true });
 */

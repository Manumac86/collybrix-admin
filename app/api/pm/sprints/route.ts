import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  sprintCreateSchema,
  sprintQuerySchema,
} from "@/lib/validation/pm-schemas";
import { z } from "zod";

/**
 * GET /api/pm/sprints
 * Get all sprints with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const queryParams = {
      projectId: searchParams.get("projectId") || undefined,
      status: searchParams.get("status") || undefined,
      page: searchParams.get("page") || "1",
      pageSize: searchParams.get("pageSize") || "50",
      sortBy: searchParams.get("sortBy") || "startDate",
      sortOrder: searchParams.get("sortOrder") || "desc",
    };

    const validated = sprintQuerySchema.parse(queryParams);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const sprintsCollection = db.collection("sprints");

    // Build filter
    const filter: any = {};

    if (validated.projectId) {
      filter.projectId = new ObjectId(validated.projectId);
    }

    if (validated.status) {
      filter.status = Array.isArray(validated.status)
        ? { $in: validated.status }
        : validated.status;
    }

    // Count total documents
    const total = await sprintsCollection.countDocuments(filter);

    // Calculate pagination
    const skip = (validated.page - 1) * validated.pageSize;
    const sortOrder = validated.sortOrder === "asc" ? 1 : -1;

    // Fetch sprints
    const sprints = await sprintsCollection
      .find(filter)
      .sort({ [validated.sortBy]: sortOrder })
      .skip(skip)
      .limit(validated.pageSize)
      .toArray();

    return NextResponse.json({
      success: true,
      data: sprints,
      meta: {
        total,
        page: validated.page,
        pageSize: validated.pageSize,
        totalPages: Math.ceil(total / validated.pageSize),
      },
    });
  } catch (error) {
    console.error("[ERROR] Error fetching sprints:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid query parameters",
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
          message: "Failed to fetch sprints",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pm/sprints
 * Create a new sprint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = sprintCreateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const sprintsCollection = db.collection("sprints");

    // Prepare sprint document
    const sprintDocument = {
      ...validated,
      projectId: new ObjectId(validated.projectId),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert sprint
    const result = await sprintsCollection.insertOne(sprintDocument);

    // Fetch the created sprint
    const createdSprint = await sprintsCollection.findOne({
      _id: result.insertedId,
    });

    return NextResponse.json(
      {
        success: true,
        data: createdSprint,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ERROR] Error creating sprint:", error);

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
          message: "Failed to create sprint",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * MongoDB Indexes for sprints collection:
 *
 * db.sprints.createIndex({ projectId: 1, status: 1 });
 * db.sprints.createIndex({ startDate: 1, endDate: 1 });
 * db.sprints.createIndex({ projectId: 1, startDate: -1 });
 * db.sprints.createIndex({ status: 1 });
 */

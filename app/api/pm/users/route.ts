import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { userCreateSchema } from "@/lib/validation/pm-schemas";
import { z } from "zod";

/**
 * GET /api/pm/users
 * Get all users
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get("isActive");
    const role = searchParams.get("role");

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const usersCollection = db.collection("users");

    // Build filter
    const filter: any = {};

    if (isActive !== null) {
      filter.isActive = isActive === "true";
    }

    if (role) {
      filter.role = role;
    }

    // Fetch users
    const users = await usersCollection
      .find(filter)
      .sort({ name: 1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: users,
      meta: {
        total: users.length,
      },
    });
  } catch (error) {
    console.error("[ERROR] Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch users",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/pm/users
 * Create a new user (placeholder - for temporary user system)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validated = userCreateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const usersCollection = db.collection("users");

    // Check if user with same email already exists
    const existingUser = await usersCollection.findOne({
      email: validated.email.toLowerCase(),
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_USER",
            message: "A user with this email already exists",
            field: "email",
          },
        },
        { status: 409 }
      );
    }

    // Prepare user document
    const userDocument = {
      ...validated,
      email: validated.email.toLowerCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert user
    const result = await usersCollection.insertOne(userDocument);

    // Fetch the created user
    const createdUser = await usersCollection.findOne({ _id: result.insertedId });

    return NextResponse.json(
      {
        success: true,
        data: createdUser,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ERROR] Error creating user:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid user data",
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
          message: "Failed to create user",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * MongoDB Indexes for users collection:
 *
 * db.users.createIndex({ email: 1 }, { unique: true });
 * db.users.createIndex({ clerkId: 1 }, { unique: true, sparse: true });
 * db.users.createIndex({ isActive: 1 });
 * db.users.createIndex({ role: 1 });
 */

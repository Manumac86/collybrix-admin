import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { userUpdateSchema } from "@/lib/validation/pm-schemas";
import { z } from "zod";

/**
 * GET /api/pm/users/[id]
 * Get a single user by ID
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
            message: "Invalid user ID format",
          },
        },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const usersCollection = db.collection("users");

    // Find user
    const user = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "User not found",
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("[ERROR] Error fetching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch user",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/pm/users/[id]
 * Update a user (supports both Clerk IDs and MongoDB ObjectIds)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if ID is a Clerk ID (starts with user_) or MongoDB ObjectId
    const isClerkId = id.startsWith("user_");

    // Validate ID format
    if (!isClerkId && !ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid user ID format - must be Clerk ID (user_xxx) or valid MongoDB ObjectId",
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validated = userUpdateSchema.parse(body);

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const usersCollection = db.collection("users");

    // Build query based on ID type
    const query = isClerkId
      ? { clerkId: id }
      : { _id: new ObjectId(id) };

    // If email is being updated, check for duplicates
    if (validated.email) {
      const duplicateQuery: any = {
        email: validated.email.toLowerCase(),
      };

      // Exclude current user from duplicate check
      if (isClerkId) {
        duplicateQuery.clerkId = { $ne: id };
      } else {
        duplicateQuery._id = { $ne: new ObjectId(id) };
      }

      const existingUser = await usersCollection.findOne(duplicateQuery);

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
    }

    // Prepare update document
    const updateDoc: any = {
      ...validated,
      updatedAt: new Date(),
    };

    if (validated.email) {
      updateDoc.email = validated.email.toLowerCase();
    }

    // For Clerk users, ensure clerkId is set
    if (isClerkId) {
      updateDoc.clerkId = id;
    }

    // Update or create user metadata
    const result = await usersCollection.findOneAndUpdate(
      query,
      {
        $set: updateDoc,
        $setOnInsert: { createdAt: new Date() }
      },
      {
        returnDocument: "after",
        upsert: true // Create if doesn't exist
      }
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "User not found and could not be created",
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
    console.error("[ERROR] Error updating user:", error);

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
          message: "Failed to update user",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/pm/users/[id]
 * Partial update of a user (e.g., deactivate user, update role)
 * Supports both Clerk IDs and MongoDB ObjectIds
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if ID is a Clerk ID (starts with user_) or MongoDB ObjectId
    const isClerkId = id.startsWith("user_");

    // Validate ID format
    if (!isClerkId && !ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message: "Invalid user ID format - must be Clerk ID (user_xxx) or valid MongoDB ObjectId",
          },
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Connect to MongoDB
    const client = await clientPromise;
    const db = client.db("collybrix");
    const usersCollection = db.collection("users");

    // Build query based on ID type
    const query = isClerkId
      ? { clerkId: id }
      : { _id: new ObjectId(id) };

    // Prepare update document
    const updateDoc: any = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.email) {
      updateDoc.email = body.email.toLowerCase();
    }

    // For Clerk users, ensure clerkId is set
    if (isClerkId) {
      updateDoc.clerkId = id;
    }

    // Update user (create if doesn't exist for Clerk users)
    const result = await usersCollection.findOneAndUpdate(
      query,
      {
        $set: updateDoc,
        $setOnInsert: { createdAt: new Date() }
      },
      {
        returnDocument: "after",
        upsert: isClerkId // Create metadata record if it doesn't exist for Clerk users
      }
    );

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "User not found",
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
    console.error("[ERROR] Error patching user:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to patch user",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

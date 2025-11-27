import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";
import clientPromise from "@/lib/mongodb";

/**
 * GET /api/users
 * Fetch all users from Clerk and merge with MongoDB metadata (role, isActive)
 */
export async function GET() {
  try {
    // Verify user is authenticated
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all users from Clerk
    const client = await clerkClient();
    const { data: clerkUsers } = await client.users.getUserList({
      limit: 100, // Adjust as needed
    });

    // Fetch user metadata from MongoDB
    const mongoClient = await clientPromise;
    const db = mongoClient.db("collybrix");
    const usersCollection = db.collection("users");

    // Get all user metadata records keyed by clerkId
    const userMetadata = await usersCollection.find({
      clerkId: { $exists: true, $ne: null }
    }).toArray();

    // Create a map for quick lookup
    const metadataMap = new Map(
      userMetadata.map(meta => [meta.clerkId, meta])
    );

    // Transform Clerk users and merge with MongoDB metadata
    const users = clerkUsers.map((user) => {
      const metadata = metadataMap.get(user.id);

      return {
        _id: user.id,
        name: user.fullName || user.firstName || user.username || "Unknown User",
        email: user.emailAddresses[0]?.emailAddress || "",
        avatarUrl: user.imageUrl || null,
        role: metadata?.role || "developer", // Use metadata role or default to developer
        isActive: metadata?.isActive !== undefined ? metadata.isActive : true,
        clerkId: user.id,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      };
    });

    return NextResponse.json({
      success: true,
      data: users,
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

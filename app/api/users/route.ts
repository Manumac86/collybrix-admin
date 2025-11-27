import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

/**
 * GET /api/users
 * Fetch all users from Clerk
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

    // Transform Clerk users to our User interface format
    const users = clerkUsers.map((user) => ({
      _id: user.id,
      name: user.fullName || user.firstName || user.username || "Unknown User",
      email: user.emailAddresses[0]?.emailAddress || "",
      avatarUrl: user.imageUrl || null,
      role: "developer" as const, // Default role - can be customized via metadata
      isActive: true,
      clerkId: user.id,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    }));

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

import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[v0] Testing MongoDB connection...")
    console.log("[v0] MONGODB_URI exists:", !!process.env.MONGODB_URI)

    const client = await connectToDatabase()
    console.log("[v0] Successfully connected to MongoDB")

    // Test a simple query
    const db = client.db("collybrix")
    const result = await db.collection("projects").countDocuments()
    console.log("[v0] Projects collection count:", result)

    return Response.json({
      success: true,
      message: "MongoDB connection successful",
      projectCount: result,
    })
  } catch (error) {
    console.error("[v0] Connection error:", error)
    return Response.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

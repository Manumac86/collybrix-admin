import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    console.log("[v0] Attempting to connect to MongoDB...")
    const client = await clientPromise
    console.log("[v0] Connected to MongoDB client")

    const db = client.db("collybrix")
    console.log("[v0] Connected to collybrix database")

    const projects = await db.collection("projects").find({}).toArray()
    console.log("[v0] Successfully fetched projects:", projects.length)

    return NextResponse.json(projects)
  } catch (error) {
    console.error("[v0] Error fetching projects:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch projects",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const client = await clientPromise
    const db = client.db("collybrix")

    const result = await db.collection("projects").insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return NextResponse.json({ id: result.insertedId, ...body }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}

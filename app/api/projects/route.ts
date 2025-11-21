import { type NextRequest, NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("collybrix")
    const projects = await db.collection("projects").find({}).toArray()

    return NextResponse.json(projects)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
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
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}

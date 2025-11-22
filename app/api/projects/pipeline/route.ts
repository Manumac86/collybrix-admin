import { getProjectPipelineStatusDistribution } from "@/app/services/projects";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getProjectPipelineStatusDistribution();
  return NextResponse.json(data);
}

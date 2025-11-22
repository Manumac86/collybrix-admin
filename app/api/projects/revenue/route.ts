import { getMonthlyRevenue, getTotalRevenue } from "@/app/services/projects";
import { NextResponse } from "next/server";

export async function GET() {
  const data = await getMonthlyRevenue();
  const totalRevenue = await getTotalRevenue();
  return NextResponse.json({ monthlyRevenueData: data, totalRevenue });
}

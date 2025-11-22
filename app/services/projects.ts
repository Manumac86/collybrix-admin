import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "../schemas/projects";
import { WithId } from "mongodb";
import { normalizeLabel } from "@/lib/utils";

export const getMonthlyRevenue = async (): Promise<
  { month: string; revenue: number }[]
> => {
  const client = await connectToDatabase();
  const db = client.db("collybrix");
  const data = await db.collection<WithId<Project>>("projects").aggregate([
    {
      // Match only active projects
      $match: { status: "active" },
    },
    {
      // Project month and mrr
      $project: {
        mmr: 1,
        month: { $substr: ["$startedDate", 5, 2] }, // extracts month as MM
        year: { $substr: ["$startedDate", 0, 4] }, // extracts year as YYYY
      },
    },
    {
      // Group by year and month (to get monthly revenue)
      $group: {
        _id: { year: "$year", month: "$month" },
        revenue: { $sum: "$mmr" },
      },
    },
    {
      // Sort by year and month descending (optional)
      $sort: { "_id.month": 1, "_id.year": 1 },
    },
    {
      // Format result to match requested structure
      $project: {
        _id: 0,
        month: {
          $concat: [
            {
              $arrayElemAt: [
                [
                  "",
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ],
                { $toInt: "$_id.month" },
              ],
            },
            " ",
            "$_id.year",
          ],
        },
        revenue: 1,
      },
    },
  ]);

  const result = await data.toArray();
  return result as { month: string; revenue: number }[];
};

export const getProjectPipelineStatusDistribution = async (): Promise<
  { stage: string; count: number }[]
> => {
  const sortOrder = {
    scouting: 0,
    "initial contact": 1,
    qualification: 2,
    discovery: 3,
    "technical evaluation": 4,
    "due diligence": 5,
    presentation: 6,
    negotiation: 7,
    terms: 8,
    closing: 9,
    "to start": 10,
    "in progress": 11,
    finished: 12,
  };
  const client = await connectToDatabase();
  const db = client.db("collybrix");
  const data = await db.collection<WithId<Project>>("projects").aggregate([
    {
      // Match only active projects
      $match: { status: "active" },
    },
    {
      // Group by pipeline state
      $group: {
        _id: "$pipelineState",
        count: { $sum: 1 },
      },
    },
  ]);

  const result = await data.toArray();
  return result
    .sort(
      (a, b) =>
        sortOrder[a._id as keyof typeof sortOrder] -
        sortOrder[b._id as keyof typeof sortOrder]
    )
    .map((item) => ({
      stage: normalizeLabel(item._id),
      count: item.count,
    })) as { stage: string; count: number }[];
};

export const getTotalRevenue = async (): Promise<number> => {
  const client = await connectToDatabase();
  const db = client.db("collybrix");
  const data = await db.collection<WithId<Project>>("projects").aggregate([
    {
      $match: { status: "active" },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$finalPrice" },
      },
    },
  ]);
  const result = await data.toArray();
  return result[0].revenue;
};

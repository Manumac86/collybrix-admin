import { connectToDatabase } from "@/lib/mongodb";
import { Project } from "../schemas/projects";
import { WithId } from "mongodb";
import { normalizeLabel } from "@/lib/utils";

export const getMonthlyRevenue = async (): Promise<
  { month: string; revenue: number }[]
> => {
  const client = await connectToDatabase();
  const db = client.db("collybrix");
  // Only include projects that are not cancelled, not closed, not not started.
  // Sum mmr per month (YYYY-MM), using startedDate
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sept",
    "Oct",
    "Nov",
    "Dev",
  ];

  // Step 1: Fetch revenue data from the database as before
  const data = await db
    .collection<WithId<Project>>("projects")
    .aggregate([
      {
        $match: {
          status: { $nin: ["cancelled", "not started", "closed"] },
          mmr: { $ne: null },
          startedDate: { $ne: null },
        },
      },
      {
        $addFields: {
          startedDateObj: { $toDate: "$startedDate" },
        },
      },
      {
        $project: {
          mmr: 1,
          monthNum: { $month: "$startedDateObj" },
          yearNum: { $year: "$startedDateObj" },
        },
      },
      {
        $group: {
          _id: { year: "$yearNum", month: "$monthNum" },
          revenue: { $sum: "$mmr" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
      {
        $project: {
          _id: 0,
          month: {
            $concat: [
              { $arrayElemAt: [monthNames, { $subtract: ["$_id.month", 1] }] },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          yearNum: "$_id.year",
          monthNum: "$_id.month",
          revenue: 1,
        },
      },
    ])
    .toArray();

  // Step 2: Always add (or update) the current month entry
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthNum = now.getMonth() + 1; // JS: 0-indexed, Mongo: 1-indexed
  const currentMonthName = monthNames[now.getMonth()];
  const currentMonthLabel = `${currentMonthName} ${currentYear}`;

  // Look for an entry with the current month. If not found, add it with revenue 0.
  let found = false;
  for (const entry of data) {
    if (entry.yearNum === currentYear && entry.monthNum === currentMonthNum) {
      found = true;
      break;
    }
  }
  if (!found) {
    data.push({
      month: currentMonthLabel,
      yearNum: currentYear,
      monthNum: currentMonthNum,
      revenue: 0,
    });
    // Sort the array again to ensure order
    data.sort((a, b) =>
      a.yearNum === b.yearNum ? a.monthNum - b.monthNum : a.yearNum - b.yearNum
    );
  }

  // Remove the helper yearNum and monthNum before returning
  const result = data.map(({ month, revenue }) => ({ month, revenue }));

  const finalRevenueData = Array.isArray(result)
    ? result.reduce(
        (
          acc: { month: string; revenue: number }[],
          curr: { month: string; revenue: number }
        ) => {
          const prevRevenue = acc.length > 0 ? acc[acc.length - 1].revenue : 0;
          acc.push({
            ...curr,
            revenue: prevRevenue + curr.revenue,
          });
          return acc;
        },
        []
      )
    : [];

  // const result = await data.toArray();
  return finalRevenueData as { month: string; revenue: number }[];
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

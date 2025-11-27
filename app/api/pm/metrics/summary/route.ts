import { type NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import {
  calculateSprintProgress,
  calculateScopeCreep,
  calculateAverageCycleTime,
  groupTasksByStatus,
} from "@/lib/pm-utils";
import { Task, Sprint, SprintSummary, ProjectSummary } from "@/types/pm";

/**
 * GET /api/pm/metrics/summary?sprintId={id}
 * Get comprehensive metrics for a sprint
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sprintId = searchParams.get("sprintId");
    const projectId = searchParams.get("projectId");

    // Sprint summary
    if (sprintId) {
      return await getSprintSummary(sprintId);
    }

    // Project summary
    if (projectId) {
      return await getProjectSummary(projectId);
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MISSING_PARAMETER",
          message: "Either sprintId or projectId query parameter is required",
        },
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("[ERROR] Error generating summary:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate summary",
          details: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Get sprint summary metrics
 */
async function getSprintSummary(sprintId: string) {
  // Validate ObjectId
  if (!ObjectId.isValid(sprintId)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_ID",
          message: "Invalid sprint ID format",
        },
      },
      { status: 400 }
    );
  }

  // Connect to MongoDB
  const client = await clientPromise;
  const db = client.db("collybrix");
  const sprintsCollection = db.collection("sprints");
  const tasksCollection = db.collection("tasks");

  // Fetch sprint
  const sprint = (await sprintsCollection.findOne({
    _id: new ObjectId(sprintId),
  })) as unknown as Sprint | null;

  if (!sprint) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Sprint not found",
        },
      },
      { status: 404 }
    );
  }

  // Fetch tasks in sprint
  const tasks = (await tasksCollection
    .find({ sprintId: new ObjectId(sprintId) })
    .toArray()) as unknown as Task[];

  console.log("tasks", tasks);

  // Calculate metrics
  const progress = calculateSprintProgress(sprint, tasks);
  const scopeCreep = calculateScopeCreep(sprint, tasks);
  const averageCycleTime = calculateAverageCycleTime(tasks);
  const tasksByStatus = groupTasksByStatus(tasks);

  // Count tasks by type
  const tasksByType = tasks.reduce((counts, task) => {
    counts[task.type] = (counts[task.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  const summary: SprintSummary = {
    sprintId: sprint._id.toString(),
    sprintName: sprint.name,
    status: sprint.status,
    startDate: sprint.startDate,
    endDate: sprint.endDate,
    capacity: sprint.capacity,
    committedPoints: sprint.committedPoints,
    completedPoints: sprint.completedPoints,
    percentageCompleted: progress.percentageCompleted,
    daysRemaining: progress.daysRemaining,
    totalDays: progress.totalDays,
    tasksTotal: tasks.length,
    tasksByStatus: Object.fromEntries(
      Object.entries(tasksByStatus).map(([status, tasks]) => [
        status,
        tasks.length,
      ])
    ) as any,
    tasksByType: tasksByType as any,
    isOverCapacity: progress.isOverCapacity,
    scopeCreep,
    averageCycleTime,
  };

  return NextResponse.json({
    success: true,
    data: summary,
  });
}

/**
 * Get project summary metrics
 */
async function getProjectSummary(projectId: string) {
  // Validate ObjectId
  if (!ObjectId.isValid(projectId)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_ID",
          message: "Invalid project ID format",
        },
      },
      { status: 400 }
    );
  }

  // Connect to MongoDB
  const client = await clientPromise;
  const db = client.db("collybrix");
  const projectsCollection = db.collection("projects");
  const tasksCollection = db.collection("tasks");
  const sprintsCollection = db.collection("sprints");
  const tagsCollection = db.collection("tags");

  // Fetch project
  const project = await projectsCollection.findOne({
    _id: new ObjectId(projectId),
  });

  if (!project) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Project not found",
        },
      },
      { status: 404 }
    );
  }

  // Fetch all tasks for project
  const tasks = (await tasksCollection
    .find({ projectId: new ObjectId(projectId) })
    .toArray()) as unknown as Task[];

  // Fetch sprints
  const sprints = (await sprintsCollection
    .find({ projectId: new ObjectId(projectId) })
    .toArray()) as unknown as Sprint[];

  const activeSprints = sprints.filter((s) => s.status === "active").length;
  const completedSprints = sprints.filter(
    (s) => s.status === "completed"
  ).length;

  // Calculate average velocity
  const completedSprintsWithVelocity = sprints.filter(
    (s) => s.status === "completed" && s.completedPoints > 0
  );
  const averageVelocity =
    completedSprintsWithVelocity.length > 0
      ? Math.round(
          completedSprintsWithVelocity.reduce(
            (sum, s) => sum + s.completedPoints,
            0
          ) / completedSprintsWithVelocity.length
        )
      : 0;

  // Group tasks by status, type, priority
  const tasksByStatus = groupTasksByStatus(tasks);
  const tasksByType = tasks.reduce((counts, task) => {
    counts[task.type] = (counts[task.type] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
  const tasksByPriority = tasks.reduce((counts, task) => {
    counts[task.priority] = (counts[task.priority] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Calculate bug ratio
  const bugCount = tasksByType.bug || 0;
  const bugRatio =
    tasks.length > 0 ? Math.round((bugCount / tasks.length) * 100) : 0;

  // Calculate total story points
  const totalStoryPoints = tasks.reduce(
    (sum, task) => sum + (task.storyPoints || 0),
    0
  );

  // Get top tags
  const tagCounts = tasks.reduce((counts, task) => {
    task.tags.forEach((tagId) => {
      const id = tagId.toString();
      counts[id] = (counts[id] || 0) + 1;
    });
    return counts;
  }, {} as Record<string, number>);

  const sortedTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const tagDetails = await tagsCollection
    .find({
      _id: { $in: sortedTags.map(([id]) => new ObjectId(id)) },
    })
    .toArray();

  const topTags = sortedTags.map(([tagId, count]) => {
    const tag = tagDetails.find((t) => t._id.toString() === tagId);
    return {
      tagId,
      tagName: tag?.name || "Unknown",
      count,
    };
  });

  const summary: ProjectSummary = {
    projectId: project._id.toString(),
    projectName: project.name,
    totalTasks: tasks.length,
    totalStoryPoints,
    tasksByStatus: Object.fromEntries(
      Object.entries(tasksByStatus).map(([status, tasks]) => [
        status,
        tasks.length,
      ])
    ) as any,
    tasksByType: tasksByType as any,
    tasksByPriority: tasksByPriority as any,
    activeSprints,
    completedSprints,
    averageVelocity,
    bugRatio,
    topTags,
  };

  return NextResponse.json({
    success: true,
    data: summary,
  });
}

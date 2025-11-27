/**
 * Script to fix corrupted task status fields
 *
 * This script finds all tasks where the status field is not a valid TaskStatus enum value
 * and resets them to "backlog".
 *
 * Usage:
 *   npx tsx scripts/fix-corrupted-task-status.ts
 */

import clientPromise from "../lib/mongodb";

const VALID_STATUSES = [
  "backlog",
  "todo",
  "in_progress",
  "in_review",
  "in_testing",
  "done",
  "blocked",
  "cancelled",
  "archived",
];

async function fixCorruptedTaskStatus() {
  try {
    console.log("Connecting to MongoDB...");
    const client = await clientPromise;
    const db = client.db("collybrix");
    const tasksCollection = db.collection("tasks");

    // Find all tasks with invalid status
    const corruptedTasks = await tasksCollection
      .find({
        status: { $nin: VALID_STATUSES },
      })
      .toArray();

    console.log(`Found ${corruptedTasks.length} tasks with corrupted status fields`);

    if (corruptedTasks.length === 0) {
      console.log("No corrupted tasks found. Database is clean!");
      return;
    }

    // Log corrupted tasks
    console.log("\nCorrupted tasks:");
    corruptedTasks.forEach((task) => {
      console.log(`  - ID: ${task._id}, Title: "${task.title}", Status: "${task.status}"`);
    });

    // Ask for confirmation
    console.log("\n⚠️  This will reset all corrupted status fields to 'backlog'");
    console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Fix corrupted tasks
    const result = await tasksCollection.updateMany(
      { status: { $nin: VALID_STATUSES } },
      {
        $set: {
          status: "backlog",
          updatedAt: new Date(),
        },
      }
    );

    console.log(`✅ Fixed ${result.modifiedCount} tasks`);
    console.log("All tasks now have valid status fields!");

  } catch (error) {
    console.error("❌ Error fixing corrupted tasks:", error);
    process.exit(1);
  }
}

// Run the script
fixCorruptedTaskStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

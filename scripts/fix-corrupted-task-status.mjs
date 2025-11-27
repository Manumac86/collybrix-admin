/**
 * Script to fix corrupted task status fields
 *
 * This script finds all tasks where the status field is not a valid TaskStatus enum value
 * and resets them to "backlog".
 *
 * Usage:
 *   node scripts/fix-corrupted-task-status.mjs
 */

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Error: MONGODB_URI environment variable is not set");
  console.log("Please create a .env.local file with your MONGODB_URI");
  process.exit(1);
}

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
  const client = new MongoClient(MONGODB_URI);

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();

    const db = client.db("collybrix");
    const tasksCollection = db.collection("tasks");

    // Find all tasks with invalid status
    const corruptedTasks = await tasksCollection
      .find({
        status: { $nin: VALID_STATUSES },
      })
      .toArray();

    console.log(`\nFound ${corruptedTasks.length} tasks with corrupted status fields`);

    if (corruptedTasks.length === 0) {
      console.log("✅ No corrupted tasks found. Database is clean!");
      return;
    }

    // Log corrupted tasks
    console.log("\n📋 Corrupted tasks:");
    corruptedTasks.forEach((task) => {
      console.log(`  - ID: ${task._id}`);
      console.log(`    Title: "${task.title}"`);
      console.log(`    Current Status: "${task.status}" ❌ (INVALID)`);
      console.log(`    Will be set to: "backlog" ✅\n`);
    });

    // Ask for confirmation
    console.log("⚠️  This will reset all corrupted status fields to 'backlog'");
    console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...\n");

    await new Promise((resolve) => setTimeout(resolve, 5000));

    console.log("Fixing corrupted tasks...");

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

    console.log(`\n✅ Fixed ${result.modifiedCount} tasks`);
    console.log("All tasks now have valid status fields!");

  } catch (error) {
    console.error("\n❌ Error fixing corrupted tasks:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\n✓ MongoDB connection closed");
  }
}

// Run the script
fixCorruptedTaskStatus()
  .then(() => {
    console.log("\n✓ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });

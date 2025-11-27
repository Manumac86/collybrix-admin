# Database Maintenance Scripts

## Fix Corrupted Task Status

### Problem
Tasks with corrupted `status` fields (containing task IDs instead of valid status enum values) cause:
- Kanban board drag-and-drop failures
- Task display issues
- Database query problems

### Solution

Run the cleanup script to fix all corrupted tasks:

```bash
npm run fix-task-status
```

Or directly:

```bash
node scripts/fix-corrupted-task-status.mjs
```

### What It Does

1. Connects to your MongoDB database
2. Finds all tasks with invalid status values (not in the valid enum)
3. Shows you which tasks are corrupted
4. Waits 5 seconds (allowing you to cancel with Ctrl+C)
5. Resets all corrupted status fields to `"backlog"`
6. Updates the `updatedAt` timestamp

### Valid Status Values

- `backlog`
- `todo`
- `in_progress`
- `in_review`
- `in_testing`
- `done`
- `blocked`
- `cancelled`
- `archived`

### Example Output

```
Connecting to MongoDB...

Found 3 tasks with corrupted status fields

📋 Corrupted tasks:
  - ID: 6924f32701b96831e1f1511c
    Title: "Task 1"
    Current Status: "6924f32701b96831e1f1511c" ❌ (INVALID)
    Will be set to: "backlog" ✅

⚠️  This will reset all corrupted status fields to 'backlog'
Press Ctrl+C to cancel, or wait 5 seconds to continue...

Fixing corrupted tasks...

✅ Fixed 3 tasks
All tasks now have valid status fields!

✓ MongoDB connection closed
✓ Script completed successfully
```

### Requirements

- Node.js installed
- `.env.local` file with `MONGODB_URI` set
- MongoDB connection available

### Safety

- The script shows you what will be changed before making any modifications
- You have 5 seconds to cancel (Ctrl+C) before changes are applied
- Only updates tasks with invalid status values
- Preserves all other task data
- Updates `updatedAt` timestamp to track when the fix was applied

### Alternative: Manual Fix via MongoDB Shell

If you prefer to fix manually:

```javascript
// Find corrupted tasks
db.tasks.find({
  status: {
    $nin: ["backlog", "todo", "in_progress", "in_review", "in_testing", "done", "blocked", "cancelled", "archived"]
  }
})

// Fix them
db.tasks.updateMany(
  {
    status: {
      $nin: ["backlog", "todo", "in_progress", "in_review", "in_testing", "done", "blocked", "cancelled", "archived"]
    }
  },
  {
    $set: {
      status: "backlog",
      updatedAt: new Date()
    }
  }
)
```

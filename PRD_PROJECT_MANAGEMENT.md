# Product Requirements Document: Project Management Section

**Project:** Collybrix Admin Dashboard - Project Management Module
**Version:** 1.0
**Date:** January 2025
**Status:** Draft

---



## 1. Executive Summary

### 1.1 Overview

This PRD outlines the requirements for adding a comprehensive Project Management section to the Collybrix Admin Dashboard. The new module will provide ClickUp-like functionality for agile project management, including backlog management, sprint planning, task tracking, and comprehensive metrics dashboards.

### 1.2 Business Objectives

- Enable internal teams to manage software development projects using agile methodologies
- Reduce dependency on external project management tools (ClickUp, Jira, etc.)
- Provide visibility into project progress, team velocity, and resource allocation
- Integrate project management data with existing project revenue and pipeline tracking
- Create a unified platform for both client-facing project tracking and internal task management

### 1.3 Target Users

- **Development Teams:** Engineers managing sprint tasks and daily work
- **Project Managers:** Planning sprints, tracking progress, managing backlogs
- **Product Owners:** Prioritizing backlog items and defining requirements
- **Executives/Stakeholders:** Viewing high-level metrics and project health

---

## 2. Current State Analysis

### 2.1 Existing System Architecture

- **Framework:** Next.js 16 with App Router
- **Database:** MongoDB with connection pooling
- **UI Components:** Radix UI + Tailwind CSS v4
- **Data Fetching:** SWR for client-side caching
- **Forms:** React Hook Form + Zod validation
- **Authentication:** Ready for Clerk integration (future)

### 2.2 Existing Features

- Projects CRUD with revenue tracking (MMR, pricing)
- Pipeline state management (discovery → finished)
- Dashboard with revenue and pipeline charts
- Milestones tracking with deliverables
- Contacts management

### 2.3 Gap Analysis

**Missing Capabilities:**

- Granular task management below project level
- Sprint planning and iteration management
- Team member assignments and workload tracking
- Story points and velocity metrics
- Kanban/Scrum board views
- Task dependencies and relationships
- Time tracking and estimation
- Comprehensive agile metrics (burndown, velocity, etc.)

---

## 3. Functional Requirements

### 3.1 Core Features (MVP)

#### 3.1.1 Backlog Management

**Description:** Central repository for all project tasks/stories before sprint assignment.

**Requirements:**

- **BL-001:** Create, read, update, delete backlog items
- **BL-002:** Backlog item types: Story, Task, Bug, Epic, Spike
- **BL-003:** Priority levels: Critical, High, Medium, Low
- **BL-004:** Story points estimation (Fibonacci: 1, 2, 3, 5, 8, 13, 21)
- **BL-005:** Rich text descriptions with markdown support
- **BL-006:** Acceptance criteria checklist
- **BL-007:** Attachments support (files, images, links)
- **BL-008:** Comments/activity log per item
- **BL-009:** Backlog grooming view with drag-to-prioritize
- **BL-010:** Filter by type, priority, assignee, tags, project
- **BL-011:** Search by title, description, ID
- **BL-012:** Bulk operations (move to sprint, change priority, add tags)

**Data Model:**

```typescript
interface BacklogItem {
  _id: ObjectId;
  projectId: ObjectId; // Link to existing Project
  title: string;
  description: string; // Markdown
  type: "story" | "task" | "bug" | "epic" | "spike";
  priority: "critical" | "high" | "medium" | "low";
  status:
    | "backlog"
    | "todo"
    | "in_progress"
    | "in_review"
    | "in_testing"
    | "blocked"
    | "cancelled"
    | "done"
    | "archived";
  storyPoints: 1 | 2 | 3 | 5 | 8 | 13 | null;
  assigneeId: ObjectId | null; // Future: Clerk user ID
  reporterId: ObjectId; // User who created the item
  sprintId: ObjectId | null; // null = unassigned to sprint
  tags: ObjectId[];
  acceptanceCriteria: Array<{ text: string; completed: boolean }>;
  attachments: Array<{
    url: string;
    name: string;
    type: "image" | "file" | "link";
  }>;
  parentId: ObjectId | null; // For epics/subtasks
  dependencies: ObjectId[]; // Blocked by other items
  estimatedHours: number | null;
  actualHours: number | null;
  dueDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
}
```

#### 3.1.2 Sprint Management

**Description:** Time-boxed iterations for organizing and tracking work.

**Requirements:**

- **SP-001:** Create sprint with name, start date, end date, goal
- **SP-002:** Sprint states: planning, active, completed, archived
- **SP-003:** Assign/unassign backlog items to sprints via drag-and-drop
- **SP-004:** Sprint capacity planning (story points vs team capacity)
- **SP-005:** Sprint commitment tracking (planned vs completed points)
- **SP-006:** Start/Complete sprint workflow
- **SP-007:** Carry over incomplete items to next sprint
- **SP-008:** Sprint retrospective notes
- **SP-009:** Multiple concurrent sprints per project (for different teams)
- **SP-010:** Sprint health indicators (on track, at risk, behind)

**Data Model:**

```typescript
interface Sprint {
  _id: ObjectId;
  projectId: ObjectId;
  name: string; // e.g., "Sprint 24"
  goal: string;
  startDate: Date;
  endDate: Date;
  status: "planning" | "active" | "completed" | "archived";
  capacity: number; // Total story points team can handle
  committedPoints: number; // Story points when sprint started
  completedPoints: number;
  retrospectiveNotes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3.1.3 Task Board Views

**Description:** Visual boards for tracking task progress during sprints.

**Requirements:**

- **TB-001:** Kanban board view with customizable columns
- **TB-002:** Default columns: Backlog, To Do, In Progress, In Review, Done
- **TB-003:** Drag-and-drop tasks between columns (updates status)
- **TB-004:** List view with sortable/filterable table
- **TB-005:** Swimlanes by: Assignee, Priority, Type, Epic
- **TB-006:** Card customization (show/hide story points, assignee, tags)
- **TB-007:** Quick actions on cards (assign, add tags, change priority)
- **TB-008:** WIP (Work In Progress) limits per column
- **TB-009:** Color coding by priority or type
- **TB-010:** Collapse/expand columns
- **TB-011:** Board filters (my tasks, unassigned, blocked)
- **TB-012:** Real-time updates when tasks change (via SWR revalidation)

**UI Components Required:**

- DnD Kit or React DnD for drag-and-drop
- Virtual scrolling for large backlogs
- Card component with hover actions
- Column component with WIP counter
- Filter/search toolbar

#### 3.1.4 Tags System

**Description:** Flexible labeling system for categorizing tasks.

**Requirements:**

- **TG-001:** Create custom tags with name and color
- **TG-002:** Apply multiple tags per task
- **TG-003:** Tag suggestions/autocomplete when typing
- **TG-004:** Filter tasks by tags
- **TG-005:** Tag usage analytics (most used tags)
- **TG-006:** Project-level tag templates (frontend, backend, design, testing, etc.)
- **TG-007:** Tag bulk operations

**Data Model:**

```typescript
interface Tag {
  _id: ObjectId;
  projectId: ObjectId;
  name: string;
  color: string; // Hex color
  createdAt: Date;
}
```

#### 3.1.5 User Assignments

**Description:** Assign tasks to team members (placeholder for future Clerk integration).

**Requirements:**

- **UA-001:** Placeholder user system (name, email, avatar URL)
- **UA-002:** Assign single user per task
- **UA-003:** Unassigned task tracking
- **UA-004:** Filter tasks by assignee
- **UA-005:** User workload view (tasks per user)
- **UA-006:** User avatar display on task cards
- **UA-007:** Reassign tasks via drag-and-drop or dropdown
- **UA-008:** "Assign to me" quick action
- **UA-009:** User deactivation (soft delete, preserve historical data)

**Data Model (Temporary):**

```typescript
interface User {
  _id: ObjectId;
  clerkId: string | null; // Future integration
  name: string;
  email: string;
  avatarUrl: string | null;
  role: "admin" | "project_manager" | "developer" | "designer" | "qa";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3.1.6 Sprint Planning View

**Description:** Dedicated interface for planning upcoming sprints.

**Requirements:**

- **SPV-001:** Side-by-side view: backlog (left) + sprint plan (right)
- **SPV-002:** Drag items from backlog to sprint
- **SPV-003:** Capacity indicator showing story points vs capacity
- **SPV-004:** Visual warning when over capacity
- **SPV-005:** Previous sprint velocity reference
- **SPV-006:** Estimated completion date based on velocity
- **SPV-007:** Assign items to team members during planning
- **SPV-008:** Sprint goal editor
- **SPV-009:** Save draft sprint vs commit sprint
- **SPV-010:** Print/export sprint plan

#### 3.1.7 Metrics Dashboard

**Description:** Comprehensive analytics for sprint and project performance.

**Requirements:**

**Sprint Metrics:**

- **MD-001:** Burndown chart (remaining story points per day)
- **MD-002:** Burnup chart (completed story points over time)
- **MD-003:** Velocity chart (completed points per sprint, last 6 sprints)
- **MD-004:** Sprint progress (% complete, days remaining)
- **MD-005:** Commitment vs completion rate
- **MD-006:** Scope creep indicator (items added mid-sprint)

**Team Metrics:**

- **MD-007:** Tasks by assignee (pie chart or bar chart)
- **MD-008:** Story points by assignee
- **MD-009:** Tasks by status (to do, in progress, done)
- **MD-010:** Average cycle time (time from to do → done)
- **MD-011:** Average lead time (time from backlog → done)
- **MD-012:** Blocked tasks count and duration

**Project Metrics:**

- **MD-013:** Total tasks by type (story, bug, task)
- **MD-014:** Bug ratio (bugs vs features)
- **MD-015:** Epic progress (% of epic's stories completed)
- **MD-016:** Project completion forecast
- **MD-017:** Tag distribution (most common tags)
- **MD-018:** Priority distribution

**Visualization Requirements:**

- Use Recharts (already in package.json)
- Responsive charts with tooltips
- Export to CSV/PDF
- Date range filters (last sprint, last 3 months, etc.)
- Real-time updates via SWR

---

### 3.2 Advanced Features (Phase 2)

#### 3.2.1 Dependencies Management

- **DEP-001:** Define "blocked by" relationships between tasks
- **DEP-002:** Visual dependency graph
- **DEP-003:** Auto-notifications when blocking task is completed
- **DEP-004:** Prevent sprint completion if dependencies unresolved

#### 3.2.2 Time Tracking

- **TT-001:** Log time spent on tasks
- **TT-002:** Time estimates vs actual tracking
- **TT-003:** Daily time entry interface
- **TT-004:** Time reports by user, project, sprint
- **TT-005:** Billable vs non-billable time

#### 3.2.3 Advanced Board Features

- **AB-001:** Custom board templates
- **AB-002:** Multiple boards per project (dev board, design board)
- **AB-003:** Archive old boards
- **AB-004:** Board permissions (who can edit columns)

#### 3.2.4 Notifications & Mentions

- **NT-001:** @mention users in comments
- **NT-002:** Email notifications for assignments
- **NT-003:** In-app notification center
- **NT-004:** Notification preferences per user

#### 3.2.5 Reporting & Exports

- **RP-001:** Custom report builder
- **RP-002:** Export sprint reports to PDF
- **RP-003:** Export backlog to CSV
- **RP-004:** Stakeholder summary reports

#### 3.2.6 Integrations

- **INT-001:** GitHub PR linking to tasks
- **INT-002:** Slack notifications
- **INT-003:** Calendar integration for sprint dates
- **INT-004:** Import from Jira/ClickUp

---

## 4. Non-Functional Requirements

### 4.1 Performance

- **NFR-001:** Board renders with 500+ tasks without lag (virtual scrolling)
- **NFR-002:** Drag-and-drop feels instant (<100ms perceived delay)
- **NFR-003:** Dashboard charts load in <2 seconds
- **NFR-004:** API responses <500ms for CRUD operations
- **NFR-005:** Optimistic UI updates (update UI before API confirmation)

### 4.2 Scalability

- **NFR-006:** Support 50+ concurrent sprints across all projects
- **NFR-007:** Support 10,000+ tasks in database
- **NFR-008:** MongoDB indexes on frequently queried fields
- **NFR-009:** Pagination for large backlogs (50 items per page)

### 4.3 Usability

- **NFR-010:** Mobile-responsive (board view adapts to mobile)
- **NFR-011:** Keyboard shortcuts (n: new task, /: search, etc.)
- **NFR-012:** Undo/redo for drag-and-drop actions
- **NFR-013:** Inline editing (double-click task title to edit)
- **NFR-014:** Tooltips for all icons and actions

### 4.4 Accessibility

- **NFR-015:** WCAG 2.1 Level AA compliance
- **NFR-016:** Screen reader support for board navigation
- **NFR-017:** Keyboard navigation for all drag-and-drop
- **NFR-018:** Color contrast ratios meet WCAG standards

### 4.5 Security

- **NFR-019:** Row-level security (users see only assigned projects)
- **NFR-020:** API endpoints validate user permissions
- **NFR-021:** XSS protection for markdown rendering
- **NFR-022:** Rate limiting on API endpoints

### 4.6 Data Integrity

- **NFR-023:** Audit log for all task changes
- **NFR-024:** Soft delete for tasks (mark as archived, not hard delete)
- **NFR-025:** Automatic backups (MongoDB replica set)
- **NFR-026:** Data validation with Zod schemas

---

## 5. Technical Architecture

### 5.1 Routing Structure

```
app/
├── project-management/
│   ├── page.tsx                    # Landing page (project selector)
│   ├── [projectId]/
│   │   ├── page.tsx                # Redirect to /board
│   │   ├── layout.tsx              # Project PM layout with tabs
│   │   ├── backlog/
│   │   │   └── page.tsx            # Backlog list view
│   │   ├── board/
│   │   │   └── page.tsx            # Kanban board
│   │   ├── sprints/
│   │   │   ├── page.tsx            # All sprints list
│   │   │   ├── [sprintId]/
│   │   │   │   ├── page.tsx        # Sprint board
│   │   │   │   └── planning/
│   │   │   │       └── page.tsx    # Sprint planning view
│   │   ├── metrics/
│   │   │   └── page.tsx            # Metrics dashboard
│   │   ├── settings/
│   │   │   └── page.tsx            # Board settings, tags, users
│   └── api/
│       ├── tasks/
│       │   ├── route.ts            # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts        # GET, PUT, DELETE, PATCH
│       ├── sprints/
│       │   ├── route.ts            # GET (list), POST (create)
│       │   └── [id]/
│       │       ├── route.ts        # GET, PUT, DELETE
│       │       └── tasks/
│       │           └── route.ts    # GET tasks in sprint
│       ├── tags/
│       │   ├── route.ts            # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts        # PUT, DELETE
│       ├── users/
│       │   ├── route.ts            # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts        # GET, PUT (update)
│       └── metrics/
│           ├── velocity/route.ts   # GET velocity data
│           ├── burndown/route.ts   # GET burndown data
│           └── summary/route.ts    # GET project summary
```

### 5.2 Database Schema

**Collections:**

- `projects` (existing)
- `tasks` (new - backlog items)
- `sprints` (new)
- `tags` (new)
- `users` (new - temporary until Clerk)
- `comments` (new - task comments)
- `task_history` (new - audit log)

**Indexes:**

```javascript
// tasks collection
db.tasks.createIndex({ projectId: 1, sprintId: 1 });
db.tasks.createIndex({ projectId: 1, status: 1 });
db.tasks.createIndex({ assigneeId: 1 });
db.tasks.createIndex({ createdAt: -1 });

// sprints collection
db.sprints.createIndex({ projectId: 1, status: 1 });
db.sprints.createIndex({ startDate: 1, endDate: 1 });

// tags collection
db.tags.createIndex({ projectId: 1 });
```

### 5.3 API Design Patterns

**RESTful Endpoints:**

- `GET /api/tasks?projectId={id}&sprintId={id}&status={status}`
- `POST /api/tasks` - Create task
- `PUT /api/tasks/{id}` - Full update
- `PATCH /api/tasks/{id}` - Partial update (for drag-and-drop)
- `DELETE /api/tasks/{id}` - Soft delete
- `POST /api/tasks/{id}/move` - Move to sprint/status

**Response Format:**

```json
{
  "success": true,
  "data": {
    /* ... */
  },
  "meta": {
    "total": 150,
    "page": 1,
    "pageSize": 50
  }
}
```

**Error Format:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Story points must be a positive number",
    "field": "storyPoints"
  }
}
```

### 5.4 State Management

- **SWR** for server state (tasks, sprints, tags)
- **React Context** for UI state (board filters, view preferences)
- **Local Storage** for user preferences (collapsed columns, etc.)
- **Optimistic Updates** for drag-and-drop actions

**Custom Hooks:**

```typescript
// lib/hooks/use-tasks.ts
export function useTasks(projectId: string, filters?: TaskFilters);
export function useTask(taskId: string);
export function useCreateTask();
export function useUpdateTask(taskId: string);
export function useDeleteTask(taskId: string);

// lib/hooks/use-sprints.ts
export function useSprints(projectId: string);
export function useSprint(sprintId: string);
export function useActiveSprint(projectId: string);
export function useCreateSprint();

// lib/hooks/use-metrics.ts
export function useVelocity(projectId: string, sprintCount: number);
export function useBurndown(sprintId: string);
export function useSprintSummary(sprintId: string);
```

### 5.5 UI Components

**New Components to Build:**

```
components/
├── pm/                             # Project Management components
│   ├── board/
│   │   ├── kanban-board.tsx        # Main board component
│   │   ├── kanban-column.tsx       # Column with drag-drop
│   │   ├── kanban-card.tsx         # Task card
│   │   ├── swimlane.tsx            # Swimlane grouping
│   │   └── board-filters.tsx       # Filter toolbar
│   ├── backlog/
│   │   ├── backlog-list.tsx        # List view
│   │   ├── backlog-item.tsx        # Item row
│   │   └── backlog-toolbar.tsx     # Actions toolbar
│   ├── sprint/
│   │   ├── sprint-card.tsx         # Sprint summary card
│   │   ├── sprint-planning.tsx     # Planning view
│   │   ├── sprint-header.tsx       # Sprint info header
│   │   └── sprint-actions.tsx      # Start/complete sprint
│   ├── task/
│   │   ├── task-dialog.tsx         # Create/edit dialog
│   │   ├── task-detail-panel.tsx   # Side panel details
│   │   ├── task-comments.tsx       # Comments section
│   │   └── task-activity.tsx       # Activity log
│   ├── metrics/
│   │   ├── burndown-chart.tsx      # Burndown visualization
│   │   ├── velocity-chart.tsx      # Velocity over time
│   │   ├── metrics-summary.tsx     # KPI cards
│   │   └── team-workload.tsx       # Workload distribution
│   └── shared/
│       ├── tag-input.tsx           # Tag selector
│       ├── user-avatar.tsx         # User avatar
│       ├── story-points-badge.tsx  # Points display
│       ├── priority-badge.tsx      # Priority indicator
│       └── status-badge.tsx        # Status indicator
```

**Existing Components to Reuse:**

- Button, Card, Dialog, Input, Select, Textarea (Radix UI)
- Badge (for tags, status)
- Dropdown Menu (for actions)
- Toast (for notifications)

### 5.6 Drag-and-Drop Implementation

**Library:** `@dnd-kit/core` (lightweight, accessible, touch-friendly)

**Installation:**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Implementation Pattern:**

```typescript
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";
import { SortableContext } from "@dnd-kit/sortable";

function KanbanBoard() {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    // Optimistic update
    updateTaskLocally(active.id, { status: over.id });

    // API call
    await updateTask(active.id, { status: over.id });
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>{/* Columns and cards */}</DndContext>
  );
}
```

---

## 6. User Stories & Acceptance Criteria

### 6.1 Epic: Backlog Management

**Story 1: As a Product Owner, I want to create and prioritize backlog items**

- Given I'm on the backlog page
- When I click "New Item"
- Then I see a dialog to enter item details
- And I can set type, priority, story points, description
- And I can save the item to the backlog
- And the item appears in the backlog list

**Story 2: As a Developer, I want to view all tasks assigned to me**

- Given I'm on the board view
- When I apply filter "Assigned to me"
- Then I see only tasks where I'm the assignee
- And I can see the status of each task

**Story 3: As a PM, I want to groom the backlog by reordering items**

- Given I'm on the backlog page
- When I drag an item up or down
- Then the item moves to the new position
- And the priority order is saved

### 6.2 Epic: Sprint Planning

**Story 4: As a PM, I want to create a new sprint**

- Given I'm on the sprints page
- When I click "New Sprint"
- Then I see a form to enter sprint details
- And I can set start date, end date, capacity, goal
- And I can save the sprint
- And the sprint appears in planning state

**Story 5: As a PM, I want to plan a sprint by moving items from backlog**

- Given I'm on the sprint planning page
- When I drag items from backlog to sprint
- Then I see the story points accumulate
- And I see a warning if I exceed capacity
- And I can commit the sprint when ready

### 6.3 Epic: Sprint Execution

**Story 6: As a Developer, I want to move tasks across the board**

- Given I'm on the active sprint board
- When I drag a task from "To Do" to "In Progress"
- Then the task status updates immediately
- And the change is saved to the database
- And the task shows in the "In Progress" column

**Story 7: As a Developer, I want to see task details without leaving the board**

- Given I'm viewing the board
- When I click on a task card
- Then a side panel opens with full task details
- And I can edit the task inline
- And I can add comments

### 6.4 Epic: Metrics & Reporting

**Story 8: As a PM, I want to see sprint burndown to track progress**

- Given a sprint is active
- When I navigate to the metrics page
- Then I see a burndown chart
- And the chart shows ideal vs actual burndown
- And I can see if we're on track

**Story 9: As a Team Lead, I want to see team velocity over time**

- Given we've completed 3+ sprints
- When I view the velocity chart
- Then I see story points completed per sprint
- And I can see our average velocity
- And I can use this for future planning

---

## 7. Design Specifications

### 7.1 Visual Design Principles

- **Consistency:** Match existing dashboard design (Collybrix brand colors)
- **Clarity:** Clear visual hierarchy for task priority and status
- **Efficiency:** Minimize clicks to complete common actions
- **Feedback:** Immediate visual feedback for all interactions

### 7.2 Color Palette (from existing dashboard)

```css
/* Primary Collybrix brand colors */
--collybrix-blue: #0055ff;
--collybrix-cyan: #00d4ff;
--collybrix-purple: #7b2fff;
--collybrix-magenta: #ff00f5;

/* Status colors */
--status-todo: #94a3b8; /* Slate */
--status-progress: #3b82f6; /* Blue */
--status-review: #8b5cf6; /* Purple */
--status-done: #10b981; /* Green */
--status-blocked: #ef4444; /* Red */

/* Priority colors */
--priority-critical: #dc2626; /* Red 600 */
--priority-high: #f59e0b; /* Amber 500 */
--priority-medium: #3b82f6; /* Blue 500 */
--priority-low: #6b7280; /* Gray 500 */
```

### 7.3 Typography

- **Headings:** Existing Geist Sans font
- **Body:** Existing Geist Sans font
- **Monospace:** Geist Mono (for task IDs)

### 7.4 Layout Patterns

**Board View:**

```
+-----------------------------------------------------------+
| Project Name > Sprint 24                     [Filters] [+] |
+-----------------------------------------------------------+
| To Do (5)  | In Progress (3) | Review (2)  | Done (12)   |
+------------+-----------------+-------------+-------------+
| [Card]     | [Card]          | [Card]      | [Card]      |
| [Card]     | [Card]          | [Card]      | [Card]      |
| [Card]     | [Card]          |             | [Card]      |
| [Card]     |                 |             | [Card]      |
| [Card]     |                 |             | ...         |
+------------+-----------------+-------------+-------------+
```

**Card Layout:**

```
+--------------------------------+
| [TYPE] TASK-123          [5pts]|
| Task title here                |
| [Tag1] [Tag2]                  |
| [Avatar] @username             |
| [Priority Badge]               |
+--------------------------------+
```

### 7.5 Responsive Breakpoints

- **Desktop:** 1280px+ (full board view)
- **Tablet:** 768px-1279px (2-3 columns, horizontal scroll)
- **Mobile:** <768px (list view recommended, board stacks vertically)

---

## 8. Implementation Phases

### Phase 1: Foundation (Weeks 1-2)

**Goal:** Basic task and sprint management

**Deliverables:**

- Database schema and migrations
- API endpoints for tasks, sprints
- Basic task creation/editing forms
- Simple list view of backlog
- Sprint CRUD operations

**Success Metrics:**

- Can create 100 tasks without errors
- API response times <500ms
- All unit tests pass

### Phase 2: Board View (Weeks 3-4)

**Goal:** Visual board with drag-and-drop

**Deliverables:**

- Kanban board component
- Drag-and-drop functionality
- Task cards with all details
- Column customization
- Status updates via drag-and-drop

**Success Metrics:**

- Board renders 200+ tasks smoothly
- Drag-and-drop works on touch devices
- Optimistic updates feel instant

### Phase 3: Sprint Planning (Week 5)

**Goal:** Sprint planning interface

**Deliverables:**

- Sprint planning view
- Backlog → sprint assignment
- Capacity tracking
- Sprint start/complete workflow
- Carry-over incomplete tasks

**Success Metrics:**

- Can plan a sprint in <10 minutes
- Capacity warnings work correctly
- Sprint state transitions work

### Phase 4: Metrics Dashboard (Week 6)

**Goal:** Comprehensive analytics

**Deliverables:**

- Burndown chart
- Velocity chart
- Team workload view
- Sprint summary metrics
- Project health indicators

**Success Metrics:**

- All charts render correctly
- Data updates in real-time
- Charts export to PNG/PDF

### Phase 5: Polish & Features (Week 7-8)

**Goal:** User experience improvements

**Deliverables:**

- Tags system
- Filtering and search
- Bulk operations
- Keyboard shortcuts
- Mobile optimizations
- User assignment (placeholder users)

**Success Metrics:**

- Search returns results in <200ms
- All keyboard shortcuts work
- Mobile board is usable

### Phase 6: Advanced Features (Week 9-10)

**Goal:** Power user features

**Deliverables:**

- Task dependencies
- Time tracking
- Comments and activity log
- Advanced filtering
- Notifications

**Success Metrics:**

- Dependency graph renders correctly
- Time tracking is accurate
- Comments save instantly

---

## 9. Recommended Additional Features

### 9.1 Template System

**Description:** Save common task patterns as templates

**Benefits:**

- Speed up task creation (e.g., "Bug Report Template")
- Ensure consistency across teams
- New team member onboarding

**Implementation:**

```typescript
interface TaskTemplate {
  _id: ObjectId;
  projectId: ObjectId;
  name: string;
  type: TaskType;
  descriptionTemplate: string; // Markdown with placeholders
  defaultTags: string[];
  defaultStoryPoints: number | null;
  acceptanceCriteriaTemplate: string[];
}
```

### 9.2 Recurring Tasks

**Description:** Auto-create tasks on a schedule

**Use Cases:**

- Weekly team meetings
- Monthly security audits
- Quarterly reviews

**Implementation:**

- Cron job or scheduled task
- Recurrence rules (daily, weekly, monthly)
- Auto-assign to rotation of team members

### 9.3 Custom Fields

**Description:** Add project-specific fields to tasks

**Examples:**

- "Customer Tier" (Enterprise, Pro, Free)
- "Affected Version"
- "Environment" (Staging, Production)

**Implementation:**

```typescript
interface CustomField {
  _id: ObjectId;
  projectId: ObjectId;
  name: string;
  type: "text" | "number" | "select" | "date" | "checkbox";
  options?: string[]; // For select type
  required: boolean;
}
```

### 9.4 Automation Rules

**Description:** Automate repetitive actions

**Examples:**

- When task status → "Done", set completed date
- When bug priority → "Critical", notify PM
- When story points > 13, suggest splitting task

**Implementation:**

- Rule engine with triggers and actions
- UI for creating rules (if/then logic)
- Audit log of automation actions

### 9.5 Epic Progress Visualization

**Description:** Visual progress bars for epics

**Features:**

- Show % of epic's stories completed
- Epic timeline with story dependencies
- Epic roadmap view (multiple epics)

### 9.6 Integration with Existing Projects

**Description:** Link PM tasks to project milestones

**Features:**

- Associate sprint with project milestone
- Roll up sprint metrics to project dashboard
- Show task completion in project timeline

**Implementation:**

```typescript
interface Milestone {
  // Existing fields...
  linkedSprintIds: ObjectId[];
  linkedTaskIds: ObjectId[];
  completionPercentage: number; // Auto-calculated
}
```

### 9.7 AI-Powered Features

**Description:** Use LLMs to enhance productivity

**Features:**

- Auto-generate acceptance criteria from task description
- Suggest story points based on similar tasks
- Auto-categorize tasks by type (bug vs feature)
- Generate sprint retrospective summaries from task data

**Implementation:**

- OpenAI API integration
- Prompt templates for each feature
- User opt-in for AI features

### 9.8 Time Zone Support

**Description:** Handle distributed teams across time zones

**Features:**

- Display sprint dates in user's local time
- "Team hours" indicator (who's online now)
- Async daily standup (record updates anytime)

### 9.9 Capacity Management

**Description:** Advanced resource planning

**Features:**

- Track team member availability (PTO, holidays)
- Adjust sprint capacity automatically
- Warn when user is over-allocated

**Implementation:**

```typescript
interface UserCapacity {
  userId: string;
  sprintId: ObjectId;
  availableHours: number;
  allocatedHours: number;
  outOfOffice: Array<{ startDate: Date; endDate: Date }>;
}
```

### 9.10 Gamification

**Description:** Motivate team with achievements

**Features:**

- Badges for milestones (100 tasks completed, etc.)
- Sprint MVP (most points completed)
- Leaderboard (opt-in)
- Streak tracking (days with completed tasks)

---

## 10. Success Metrics & KPIs

### 10.1 Adoption Metrics

- **Daily Active Users:** 80%+ of dev team uses PM daily
- **Tasks Created:** 50+ tasks created per week
- **Sprint Completion Rate:** 75%+ of committed points completed
- **Time to First Task:** New users create their first task in <5 minutes

### 10.2 Performance Metrics

- **Page Load Time:** <2 seconds (95th percentile)
- **API Response Time:** <500ms (99th percentile)
- **Board Interaction Latency:** <100ms perceived delay
- **Search Results:** <200ms

### 10.3 Quality Metrics

- **Bug Rate:** <5% of tasks are bugs (vs features)
- **Rework Rate:** <10% of done tasks move back to in progress
- **Scope Creep:** <20% increase in sprint scope mid-sprint
- **Velocity Stability:** <30% variance sprint-to-sprint

### 10.4 Business Metrics

- **External Tool Cost Savings:** Reduce ClickUp/Jira licenses
- **Time Savings:** 30 minutes/day saved vs external tools (integrated platform)
- **Project Visibility:** 100% of projects use PM section
- **Data Accuracy:** Real-time sync with project revenue data

---

## 11. Risks & Mitigations

### 11.1 Technical Risks

| Risk                                       | Impact | Probability | Mitigation                                                 |
| ------------------------------------------ | ------ | ----------- | ---------------------------------------------------------- |
| Performance degrades with large datasets   | High   | Medium      | Implement virtual scrolling, pagination, MongoDB indexes   |
| Drag-and-drop conflicts (concurrent edits) | Medium | Low         | Optimistic locking, last-write-wins with user notification |
| MongoDB connection pool exhaustion         | High   | Low         | Reuse existing connection singleton, monitor pool size     |
| SWR cache inconsistencies                  | Medium | Medium      | Use mutate() after all updates, revalidation on focus      |

### 11.2 User Adoption Risks

| Risk                                  | Impact | Probability | Mitigation                                           |
| ------------------------------------- | ------ | ----------- | ---------------------------------------------------- |
| Team resists switching from ClickUp   | High   | Medium      | Phased rollout, import tool, training sessions       |
| Feature parity gaps vs existing tools | Medium | High        | Prioritize most-used features first, gather feedback |
| Steep learning curve                  | Medium | Low         | Onboarding checklist, tooltips, video tutorials      |

### 11.3 Product Risks

| Risk                                             | Impact | Probability | Mitigation                                                 |
| ------------------------------------------------ | ------ | ----------- | ---------------------------------------------------------- |
| Scope creep delays launch                        | High   | High        | Strict MVP definition, defer nice-to-haves to Phase 2      |
| Lack of Clerk integration delays user management | Medium | Low         | Build placeholder user system, migrate later               |
| Metrics accuracy issues                          | Medium | Medium      | Thorough testing, cross-reference with manual calculations |

---

## 12. Open Questions & Decisions Needed

### 12.1 Product Decisions

- [ ] **Decision:** Should we support multiple projects per sprint (cross-project sprints)?

  - **Recommendation:** Start with single project per sprint, add later if needed

- [ ] **Decision:** Default sprint duration (1 week, 2 weeks)?

  - **Recommendation:** Make configurable, default to 2 weeks

- [ ] **Decision:** Can users edit tasks in completed sprints?

  - **Recommendation:** Read-only after sprint complete, require admin override

- [ ] **Decision:** Do we need sub-tasks (tasks within tasks)?
  - **Recommendation:** Use parentId field, defer UI to Phase 2

### 12.2 Technical Decisions

- [ ] **Decision:** Real-time updates via WebSockets or polling?

  - **Recommendation:** SWR polling (revalidateOnFocus), add WebSockets in Phase 3

- [ ] **Decision:** Client-side or server-side rendering for boards?

  - **Recommendation:** Client-side for interactivity, SSR for initial load

- [ ] **Decision:** Store task history in separate collection or embedded?
  - **Recommendation:** Separate `task_history` collection for better querying

### 12.3 Integration Decisions

- [ ] **Decision:** When to integrate Clerk authentication?

  - **Recommendation:** Build placeholder user system now, migrate when User Management section is built

- [ ] **Decision:** Should PM section link to ClickUp MCP for import?
  - **Recommendation:** Yes, build import tool to migrate existing ClickUp data

---

## 13. Dependencies & Prerequisites

### 13.1 External Dependencies

- **Clerk Authentication:** User management section (Phase 2+)
- **Design Assets:** Collybrix brand guidelines for colors/logos
- **ClickUp API Access:** For data import tool (optional)

### 13.2 Technical Prerequisites

- MongoDB collections created
- API endpoints scaffolded
- UI components from Radix UI available
- SWR hooks pattern established

### 13.3 Team Dependencies

- **Design:** Board layout mockups, task card design
- **Backend:** API endpoint implementation
- **Frontend:** React components, drag-and-drop integration
- **QA:** Test plan for sprint workflows

---

## 14. Glossary

| Term             | Definition                                                        |
| ---------------- | ----------------------------------------------------------------- |
| **Backlog**      | Collection of unassigned tasks/stories for a project              |
| **Sprint**       | Time-boxed iteration (usually 1-4 weeks) for completing work      |
| **Story Points** | Relative estimation unit for task complexity (Fibonacci sequence) |
| **Velocity**     | Average story points completed per sprint                         |
| **Burndown**     | Chart showing remaining work over time within a sprint            |
| **Burnup**       | Chart showing completed work accumulating over time               |
| **Epic**         | Large feature that spans multiple sprints, composed of stories    |
| **Story**        | User-facing feature or requirement                                |
| **Task**         | Technical work item (not directly user-facing)                    |
| **Bug**          | Defect or issue to be fixed                                       |
| **Spike**        | Research or investigation task                                    |
| **WIP Limit**    | Maximum number of tasks allowed in a column                       |
| **Cycle Time**   | Time from when work starts to when it's completed                 |
| **Lead Time**    | Time from task creation to completion                             |
| **Capacity**     | Total story points a team can handle in a sprint                  |

---

## 15. Appendices

### 15.1 Wireframes

(To be created by design team)

### 15.2 User Research

(To be conducted after MVP)

### 15.3 Competitive Analysis

| Feature            | ClickUp | Jira | Linear | Collybrix PM     |
| ------------------ | ------- | ---- | ------ | ---------------- |
| Backlog Management | ✅      | ✅   | ✅     | ✅ (MVP)         |
| Sprint Planning    | ✅      | ✅   | ✅     | ✅ (MVP)         |
| Kanban Board       | ✅      | ✅   | ✅     | ✅ (MVP)         |
| Drag-and-Drop      | ✅      | ✅   | ✅     | ✅ (MVP)         |
| Story Points       | ✅      | ✅   | ✅     | ✅ (MVP)         |
| Velocity Tracking  | ✅      | ✅   | ✅     | ✅ (MVP)         |
| Burndown Chart     | ✅      | ✅   | ⚠️     | ✅ (MVP)         |
| Time Tracking      | ✅      | ✅   | ⚠️     | ✅ (Phase 2)     |
| Dependencies       | ✅      | ✅   | ✅     | ✅ (Phase 2)     |
| Custom Fields      | ✅      | ✅   | ✅     | ✅ (Recommended) |
| Automation         | ✅      | ✅   | ✅     | 📋 (Recommended) |
| GitHub Integration | ✅      | ✅   | ✅     | 📋 (Phase 2)     |
| AI Features        | ✅      | ⚠️   | ⚠️     | 📋 (Recommended) |

**Legend:** ✅ = Included, ⚠️ = Limited/Paid only, 📋 = Planned

### 15.4 API Examples

**Create Task:**

```bash
POST /api/tasks
Content-Type: application/json

{
  "projectId": "507f1f77bcf86cd799439011",
  "title": "Implement user authentication",
  "description": "Add login/signup with Clerk",
  "type": "story",
  "priority": "high",
  "storyPoints": 5,
  "tags": ["auth", "frontend"]
}
```

**Move Task to Sprint:**

```bash
PATCH /api/tasks/507f1f77bcf86cd799439012
Content-Type: application/json

{
  "sprintId": "507f1f77bcf86cd799439013",
  "status": "todo"
}
```

**Get Sprint Burndown:**

```bash
GET /api/metrics/burndown?sprintId=507f1f77bcf86cd799439013

Response:
{
  "success": true,
  "data": {
    "sprintId": "507f1f77bcf86cd799439013",
    "startDate": "2025-01-20",
    "endDate": "2025-02-02",
    "totalPoints": 34,
    "dailyData": [
      { "date": "2025-01-20", "remaining": 34, "ideal": 34 },
      { "date": "2025-01-21", "remaining": 32, "ideal": 31.5 },
      { "date": "2025-01-22", "remaining": 28, "ideal": 29 },
      // ...
    ]
  }
}
```

---

## 16. Approval & Sign-off

| Role          | Name  | Signature | Date |
| ------------- | ----- | --------- | ---- |
| Product Owner | [TBD] |           |      |
| Tech Lead     | [TBD] |           |      |
| Designer      | [TBD] |           |      |
| Stakeholder   | [TBD] |           |      |

---

**Document Version History:**

| Version | Date       | Author      | Changes           |
| ------- | ---------- | ----------- | ----------------- |
| 1.0     | 2025-01-23 | Claude Code | Initial PRD draft |

---

## Next Steps

1. **Review & Approval:** Stakeholder review of PRD (Week 0)
2. **Design Phase:** Create wireframes and mockups (Week 1)
3. **Technical Planning:** Architecture review, story pointing (Week 1)
4. **Development:** Begin Phase 1 implementation (Week 2)
5. **User Testing:** Alpha testing with dev team (Week 6)
6. **Beta Launch:** Limited rollout to 1-2 projects (Week 8)
7. **Full Launch:** All projects migrated (Week 10)

---

**End of PRD**

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Collybrix Admin Dashboard - A Next.js application for managing projects, contacts, and revenue. The application uses MongoDB for data persistence and is deployed on Vercel. This project was initially built using v0.app and continues to sync with it.

## Development Commands

**IMPORTANT: Always use `pnpm` for this project, not `npm` or `yarn`.**

```bash
# Start development server (default: http://localhost:3000)
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Install dependencies
pnpm install
```

## Environment Setup

Required environment variables (create a `.env.local` file):

```
MONGODB_URI=<your-mongodb-connection-string>
```

The application connects to a MongoDB database named `collybrix` with a `projects` collection.

## Architecture

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 with Radix UI components + Tailwind CSS v4
- **Database**: MongoDB with native driver
- **Data Fetching**: SWR for client-side data fetching
- **Forms**: React Hook Form + Zod validation
- **Deployment**: Vercel

### Directory Structure

- `app/` - Next.js App Router pages and API routes

  - `app/api/projects/` - REST API for CRUD operations on projects
    - `GET /api/projects` - List all projects
    - `POST /api/projects` - Create new project
    - `GET /api/projects/[id]` - Get single project
    - `PUT /api/projects/[id]` - Update project
    - `DELETE /api/projects/[id]` - Delete project
  - `app/api/seed/` - Database seeding endpoint (POST only)
  - `app/api/test-connection/` - MongoDB connection health check
  - `app/dashboard/` - Dashboard page
  - `app/projects/` - Projects list and detail pages
  - `app/contacts/` - Contacts management page

- `components/` - React components

  - `components/ui/` - Shadcn/Radix UI base components (alert-dialog, button, card, dialog, dropdown-menu, input, label, select, textarea, toast)
  - Feature components: `add-project-dialog.tsx`, `edit-project-dialog.tsx`, `projects-table.tsx`, `dashboard-content.tsx`, etc.

- `lib/` - Utility modules
  - `lib/mongodb.ts` - MongoDB connection singleton with connection pooling
  - `lib/data.ts` - Mock/seed data for projects and contacts
  - `hooks/projects.ts` - SWR hooks for fetching projects data
  - `lib/utils.ts` - Utility functions

### MongoDB Connection Pattern

The application uses a singleton pattern for MongoDB connections to prevent connection exhaustion during development hot-reloading. Connection is configured with:

- Retry writes enabled
- Write concern: majority
- Max pool size: 10 connections
- Server selection timeout: 10s
- Socket timeout: 45s

In development mode, the connection is stored in a global variable to persist across hot reloads.

### Data Model

Projects have the following structure:

```typescript
{
  _id: ObjectId,
  name: string,
  company: string,
  status: "active" | string,
  startedDate: string, // ISO date
  pipelineState: "discovery" | "qualification" | "technical evaluation" | "in progress" | "finished",
  initialPricing: number,
  finalPrice: number | null,
  projectType: "Software Factory" | "Accelleration" | "Consulting" | "SaaS",
  mmr: number, // Monthly Recurring Revenue
  paymentStatus: "paid" | "partial" | "pending",
  description: string,
  docsLink: string,
  milestones: Array<{
    date: string,
    type: "kickoff" | "design" | "development" | "testing" | "analysis" | "implementation" | "launch",
    name: string,
    description: string,
    deliverable: string
  }>,
  createdAt: Date,
  updatedAt: Date
}
```

### API Patterns

- All API routes use Next.js App Router route handlers
- Errors are logged with `[ERROR]` prefix for easy filtering
- API responses include error details in development for debugging
- MongoDB ObjectId is used for project IDs
- All mutations (POST/PUT) automatically update `createdAt`/`updatedAt` timestamps

### Client-Side Data Fetching

The application uses SWR for data fetching with custom hooks:

- `useProjects()` - Fetches all projects, returns `{ projects, isLoading, error, isError, mutate }`
- `useProject(id)` - Fetches single project, returns `{ project, isLoading, error, isError, mutate }`

Both hooks use automatic revalidation and provide a `mutate` function for cache invalidation.

## Important Configuration

### TypeScript

- Build errors are ignored (`ignoreBuildErrors: true` in next.config.mjs)
- Path alias `@/*` maps to project root

### Next.js

- Images are unoptimized for static export compatibility
- Uses Google Fonts: Geist, Geist Mono, Source Serif 4

### Styling

- Tailwind CSS v4 with PostCSS
- Theme provider supports system/light/dark modes
- Custom Tailwind classes via `tailwind-merge` and `class-variance-authority`

## Database Seeding

Use the seed endpoint to populate initial data:

```bash
curl -X POST http://localhost:3000/api/seed
```

This will insert 6 sample projects if the database is empty.

## Common Patterns

### Adding a New API Route

1. Create route handler in `app/api/[route]/route.ts`
2. Import MongoDB client: `import clientPromise from "@/lib/mongodb"`
3. Use try-catch with descriptive error messages
4. Log with `[ERROR]` prefix for consistency

### Adding a New Component

1. Place in `components/` directory
2. Use TypeScript with proper types from React
3. Import UI components from `@/components/ui/`
4. Follow existing patterns for dialogs, forms, and tables

### Creating a Form with Validation

1. Use React Hook Form + Zod
2. Import resolvers: `@hookform/resolvers/zod`
3. Follow patterns in `add-project-dialog.tsx` or `edit-project-dialog.tsx`

### Frontend State Management & Architecture Guidelines

**IMPORTANT**: Follow these guidelines for all frontend development to ensure consistent, maintainable, and performant React applications.

**Core Principles:**

1. 🔄 **SWR for data** - automatic caching, revalidation, deduplication
2. 🎯 **Context for UI state** - view modes, selections, UI-only state
3. ⚡ **Server Components first** - reduce client JavaScript
4. 🧩 **Composition over complexity** - small, focused components
5. 🚫 **Avoid useEffect** - use hooks, memos, and proper patterns
6. 📝 **Simple business logic** - pure functions, testable utilities

This pattern provides better performance, maintainability, and aligns with Next.js 16+ best practices.

#### PARAMS in API Routes

```typescript
// app/api/projects/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return NextResponse.json({ id, message: "Hello, world!" });
}
```

**Key points:**

- `params` is a promise that resolves to an object with the parameters
- `await params` resolves the promise
- `const { id } = await params` destructures the object to get the id
- `return NextResponse.json({ id, message: "Hello, world!" })` returns the id and message as a JSON response

#### State Management Pattern: SWR + Context API

**DO NOT use Zustand** or other global state management libraries. Instead, use the SWR + Context API pattern for better control, caching, and React Server Component optimization.

#### Data Fetching with SWR

**Create custom hooks wrapping `useSWR`** for all data fetching operations:

```typescript
// modules/{feature}/hooks/use{Resource}.ts
import useSWR from "swr";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  });

export const useUsers = (options = {}) => {
  const { search = "", page = 1 } = options;

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  params.append("page", page.toString());

  const { data, error, isLoading, mutate } = useSWR(
    `/api/users?${params.toString()}`,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    users: data?.users || [],
    total: data?.total || 0,
    isLoading,
    error,
    mutate, // For manual cache updates
  };
};
```

**Key points:**

- URL becomes the cache key (automatic deduplication)
- Include query params in the URL for proper caching
- Return destructured data with sensible defaults
- Expose `mutate` for cache invalidation
- Configure `revalidateOnFocus` and `dedupingInterval` appropriately

#### Mutations with SWR

**Create separate hooks for mutations** (create, update, delete):
** Reference to https://swr.vercel.app/docs/mutation **

```typescript
// modules/{feature}/hooks/use{Resource}Mutations.ts
import { useSWRConfig } from "swr";

export const useTaskMutations = () => {
  const { mutate } = useSWRMutation();

  const createTask = async (data: TaskCreate) => {
    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create");

    // Invalidate cache to refetch
    mutate((key) => typeof key === "string" && key.startsWith("/api/tasks"));

    return res.json();
  };

  const updateTask = async (id: string, payload: TaskUpdate) => {
    // Optimistic update
    mutate(
      `/api/tasks/${id}`,
      async () => {
        const res = await fetch(`/api/tasks/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error("Failed to update");
        return res.json();
      },
      { optimisticData: payload, revalidate: true }
    );
  };

  return { createTask, updateTask, deleteTask };
};
```

**Key points:**

- Use `useSWRConfig().mutate` for global cache updates
- Implement optimistic updates for better UX
- Invalidate related caches after mutations
- Return async functions for components to await

#### Context API for UI State Only

**Use Context sparingly** - only for UI state that needs to be shared across deep component trees:

```typescript
// modules/{feature}/context/{Feature}Context.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type TasksUIState = {
  viewMode: "list" | "kanban";
  selectionMode: boolean;
  selectedIds: string[];
};

const TasksContext = createContext<TasksUIState | undefined>(undefined);

export const TasksProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <TasksContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectionMode,
        setSelectionMode,
        selectedIds,
        setSelectedIds,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasksUI = () => {
  const context = useContext(TasksContext);
  if (!context) throw new Error("useTasksUI must be used within TasksProvider");
  return context;
};
```

**Guidelines for Context usage:**

- ❌ **DO NOT** use for data fetching (use SWR hooks instead)
- ✅ **DO** use for UI state (view modes, selections, modals)
- ❌ **DO NOT** create contexts for every component
- ✅ **DO** prefer component composition and props when possible

#### React Server Components (RSC) First

**Prioritize Server Components** and only use Client Components when absolutely necessary:

**✅ Server Components (default):**

- Pure display components
- Components that fetch data at build/request time
- Static content, layouts, empty states
- Components without interactivity

**❌ Client Components (use sparingly):**

- Components using hooks (`useState`, `useEffect`, etc.)
- Event handlers (`onClick`, `onChange`, etc.)
- Browser APIs (`localStorage`, `window`, etc.)
- Third-party libraries requiring client-side JS

**Push "use client" to the smallest boundary possible:**

```typescript
// ❌ BAD: Entire dashboard is client
"use client";

export function TasksDashboard() {
  const { tasks } = useTasks();
  return (
    <div>
      <TasksHeader />
      <TasksFilters />
      <TasksList tasks={tasks} />
    </div>
  );
}

// ✅ GOOD: Only interactive parts are client
export function TasksDashboard() {
  return (
    <div>
      <TasksHeader /> {/* Server component */}
      <TasksFiltersClient /> {/* Client - has inputs */}
      <TasksListClient /> {/* Client - has interactions */}
    </div>
  );
}
```

#### Component Composition Over Complexity

**Keep components small and focused:**

```typescript
// ❌ BAD: 500-line component with everything
'use client';

export function TasksDashboard() {
  const [filters, setFilters] = useState(...);
  const [viewMode, setViewMode] = useState(...);
  const [selection, setSelection] = useState(...);

  // 400 lines of logic...

  return (/* 100 lines of JSX */);
}

// ✅ GOOD: Composed from smaller components
export function TasksDashboard() {
  return (
    <TasksProvider>
      <TasksHeader />
      <TasksToolbar />
      <TasksContent />
    </TasksProvider>
  );
}
```

**Benefits:**

- Easier to test individual pieces
- Better code splitting
- Clearer separation of concerns
- Easier to optimize performance

#### Avoid useEffect When Possible

**Replace `useEffect` with better patterns:**

```typescript
// ❌ BAD: useEffect for data fetching
useEffect(() => {
  fetchData();
}, [dependency]);

// ✅ GOOD: SWR handles it
const { data } = useSWR("/api/data", fetcher);

// ❌ BAD: useEffect for derived state
useEffect(() => {
  setFiltered(tasks.filter((t) => t.status === filter));
}, [tasks, filter]);

// ✅ GOOD: useMemo
const filtered = useMemo(
  () => tasks.filter((t) => t.status === filter),
  [tasks, filter]
);

// ❌ BAD: useEffect for URL sync
useEffect(() => {
  const params = new URLSearchParams({ filter });
  window.history.replaceState({}, "", `?${params}`);
}, [filter]);

// ✅ GOOD: URL as source of truth in SWR key
const searchParams = useSearchParams();
const filter = searchParams.get("filter") || "";
const { data } = useSWR(`/api/tasks?filter=${filter}`, fetcher);
```

**When `useEffect` IS appropriate:**

- Third-party library initialization
- DOM manipulation that can't be done declaratively
- Setting up/cleaning up subscriptions
- Browser API integration (but consider Server Components first)

#### Business Logic Simplicity

**Keep business logic simple and testable:**

```typescript
// ✅ Extract complex logic to utility functions
// utils/taskHelpers.ts
export const calculateTaskStats = (tasks: Task[]) => ({
  total: tasks.length,
  pending: tasks.filter((t) => t.status === "pending").length,
  completed: tasks.filter((t) => t.status === "completed").length,
});

// Component stays simple
export function TasksStats({ tasks }: { tasks: Task[] }) {
  const stats = calculateTaskStats(tasks);
  return <Stats {...stats} />;
}
```

**Benefits:**

- Pure functions are easy to test
- Logic is reusable across components
- Components focus on presentation
- Better TypeScript inference

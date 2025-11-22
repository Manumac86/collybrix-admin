# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Collybrix Admin Dashboard - A Next.js application for managing projects, contacts, and revenue. The application uses MongoDB for data persistence and is deployed on Vercel. This project was initially built using v0.app and continues to sync with it.

## Development Commands

```bash
# Start development server (default: http://localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
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
- Errors are logged with `[v0]` prefix for easy filtering
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
4. Log with `[v0]` prefix for consistency

### Adding a New Component

1. Place in `components/` directory
2. Use TypeScript with proper types from React
3. Import UI components from `@/components/ui/`
4. Follow existing patterns for dialogs, forms, and tables

### Creating a Form with Validation

1. Use React Hook Form + Zod
2. Import resolvers: `@hookform/resolvers/zod`
3. Follow patterns in `add-project-dialog.tsx` or `edit-project-dialog.tsx`

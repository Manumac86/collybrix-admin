/**
 * Loading Skeleton Components
 * Reusable skeleton loaders for different PM page types
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card";

/**
 * Generic skeleton loader with pulse animation
 */
interface SkeletonProps {
  className?: string;
}

function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-muted rounded ${className}`}
      role="status"
      aria-label="Loading..."
    />
  );
}

/**
 * Board (Kanban) Loading Skeleton
 * Shows 4 columns with 3 cards each
 */
export function BoardSkeleton() {
  return (
    <div className="flex gap-4 p-6 overflow-x-auto">
      {[1, 2, 3, 4].map((col) => (
        <div key={col} className="flex-shrink-0 w-80">
          <div className="bg-muted rounded-lg p-4">
            {/* Column header */}
            <div className="mb-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-16" />
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {[1, 2, 3].map((card) => (
                <div
                  key={card}
                  className="bg-card rounded-lg p-4 border"
                >
                  <Skeleton className="h-5 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <div className="flex justify-between items-center mt-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Table Loading Skeleton
 * Used for backlog and sprint lists
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 py-3 border-b"
        >
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Loading Skeleton
 * Used for metrics charts
 */
export function ChartSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full ${height}`} />
      </CardContent>
    </Card>
  );
}

/**
 * Generic Card Skeleton
 * Used for project cards and other card-based layouts
 */
export function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <div className="flex gap-2 mt-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Metrics Dashboard Skeleton
 * Complete metrics page skeleton
 */
export function MetricsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <ChartSkeleton height="h-80" />
      </div>
    </div>
  );
}

/**
 * Sprint Planning Skeleton
 * Skeleton for sprint planning view
 */
export function SprintPlanningSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
      {/* Backlog Column */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sprint Column */}
      <div>
        <Skeleton className="h-6 w-32 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * List Skeleton
 * Generic list skeleton for various views
 */
export function ListSkeleton({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <Card key={i}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

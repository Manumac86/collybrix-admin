"use client";

import { format, differenceInDays } from "date-fns";
import {
  Calendar,
  Target,
  Edit,
  Play,
  CheckCircle,
  Trash2,
} from "lucide-react";
import { Sprint, SprintStatus } from "@/types/pm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface SprintHeaderProps {
  sprint: Sprint;
  onEdit?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<
  SprintStatus,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
> = {
  planning: { label: "Planning", variant: "outline" },
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  archived: { label: "Archived", variant: "destructive" },
};

/**
 * SprintHeader Component
 *
 * Shows sprint name, goal, date range, status badge, progress information, and action buttons
 * Action buttons based on status:
 * - Planning: "Start Sprint", "Delete"
 * - Active: "Complete Sprint"
 * - Completed: "View Retrospective"
 *
 * @example
 * <SprintHeader
 *   sprint={sprint}
 *   onEdit={handleEdit}
 *   onStart={handleStart}
 *   onComplete={handleComplete}
 *   onDelete={handleDelete}
 * />
 */
export function SprintHeader({
  sprint,
  onEdit,
  onStart,
  onComplete,
  onDelete,
}: SprintHeaderProps) {
  const now = new Date();
  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const totalDays = differenceInDays(endDate, startDate);
  const daysRemaining = differenceInDays(endDate, now);
  const daysElapsed = differenceInDays(now, startDate);

  const progressPercentage =
    sprint.committedPoints > 0
      ? Math.round((sprint.completedPoints / sprint.committedPoints) * 100)
      : 0;

  const timePercentage =
    totalDays > 0 ? Math.round((daysElapsed / totalDays) * 100) : 0;

  return (
    <div className="space-y-4 border-b p-4">
      {/* Title and Status */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{sprint.name}</h1>
            <Badge
              variant={STATUS_CONFIG[sprint.status].variant}
              className="text-sm"
            >
              {STATUS_CONFIG[sprint.status].label}
            </Badge>
          </div>

          {sprint.goal && (
            <div className="flex items-start gap-2 text-muted-foreground">
              <Target className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-lg">{sprint.goal}</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {sprint.status === "planning" && onStart && (
            <Button size="sm" onClick={onStart}>
              <Play className="h-4 w-4 mr-2" />
              Start Sprint
            </Button>
          )}

          {sprint.status === "active" && onComplete && (
            <Button size="sm" onClick={onComplete}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Sprint
            </Button>
          )}

          {sprint.status === "planning" && onDelete && (
            <Button variant="destructive" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Date Range and Progress */}
      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>
            {format(startDate, "MMM d")} - {format(endDate, "MMM d, yyyy")}
          </span>
        </div>

        {sprint.status === "active" && (
          <>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {daysRemaining > 0
                  ? `${daysRemaining} days remaining`
                  : daysRemaining === 0
                  ? "Last day"
                  : "Sprint ended"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">
                {progressPercentage}% complete
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">
                {sprint.completedPoints} / {sprint.committedPoints} points
              </span>
            </div>
          </>
        )}

        {sprint.status === "completed" && (
          <>
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {sprint.completedPoints} / {sprint.committedPoints} points
                completed
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-medium">
                {progressPercentage}% complete
              </span>
            </div>
          </>
        )}

        {sprint.status === "planning" && (
          <div className="flex items-center gap-2">
            <span className="font-medium">
              Capacity: {sprint.capacity} points
            </span>
          </div>
        )}
      </div>

      {/* Progress Bar (Active Sprint) */}
      {sprint.status === "active" && (
        <div className="space-y-1">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground text-right">
            Time: {timePercentage}% elapsed
          </p>
        </div>
      )}
    </div>
  );
}

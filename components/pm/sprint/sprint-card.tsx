"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Calendar,
  Target,
  TrendingUp,
  AlertTriangle,
  MoreVertical,
  Play,
  CheckCircle,
  Edit,
  Trash2,
} from "lucide-react";
import { Sprint, SprintStatus } from "@/types/pm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { CapacityIndicator } from "./capacity-indicator";

interface SprintCardProps {
  sprint: Sprint;
  projectId: string;
  onEdit?: () => void;
  onStart?: () => void;
  onComplete?: () => void;
  onDelete?: () => void;
}

const STATUS_CONFIG: Record<
  SprintStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  planning: { label: "Planning", variant: "outline" },
  active: { label: "Active", variant: "default" },
  completed: { label: "Completed", variant: "secondary" },
  archived: { label: "Archived", variant: "destructive" },
};

/**
 * SprintCard Component
 *
 * Displays sprint summary with:
 * - Name, goal, date range, status badge
 * - Progress bar (completed/committed points)
 * - Capacity indicator with visual warning
 * - Sprint health indicator (on track, at risk, behind)
 * - Click to navigate to sprint detail
 * - Actions dropdown: Edit, Start, Complete, Delete
 *
 * @example
 * <SprintCard sprint={sprint} projectId={projectId} onEdit={handleEdit} />
 */
export function SprintCard({
  sprint,
  projectId,
  onEdit,
  onStart,
  onComplete,
  onDelete,
}: SprintCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const progressPercentage =
    sprint.committedPoints > 0
      ? (sprint.completedPoints / sprint.committedPoints) * 100
      : 0;

  const capacityPercentage =
    sprint.capacity > 0 ? (sprint.committedPoints / sprint.capacity) * 100 : 0;

  const isOverCapacity = capacityPercentage > 100;

  // Calculate sprint health
  const getSprintHealth = () => {
    if (sprint.status !== "active") return null;

    const now = new Date();
    const start = new Date(sprint.startDate);
    const end = new Date(sprint.endDate);
    const totalDuration = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    const timePercentage = (elapsed / totalDuration) * 100;

    if (progressPercentage >= timePercentage - 10) {
      return { status: "on-track", label: "On Track", color: "text-green-600" };
    } else if (progressPercentage >= timePercentage - 30) {
      return { status: "at-risk", label: "At Risk", color: "text-yellow-600" };
    } else {
      return { status: "behind", label: "Behind", color: "text-red-600" };
    }
  };

  const health = getSprintHealth();

  const handleCardClick = () => {
    router.push(`/project-management/${projectId}/sprints/${sprint._id}`);
  };

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <CardTitle className="text-lg font-semibold">
              {sprint.name}
            </CardTitle>
            <Badge variant={STATUS_CONFIG[sprint.status].variant}>
              {STATUS_CONFIG[sprint.status].label}
            </Badge>
            {isOverCapacity && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          {sprint.goal && (
            <p className="text-sm text-muted-foreground line-clamp-2 flex items-start gap-2">
              <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{sprint.goal}</span>
            </p>
          )}
        </div>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                  setIsOpen(false);
                }}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Sprint
              </DropdownMenuItem>
            )}
            {sprint.status === "planning" && onStart && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onStart();
                  setIsOpen(false);
                }}
              >
                <Play className="h-4 w-4 mr-2" />
                Start Sprint
              </DropdownMenuItem>
            )}
            {sprint.status === "active" && onComplete && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                  setIsOpen(false);
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Sprint
              </DropdownMenuItem>
            )}
            {onDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                    setIsOpen(false);
                  }}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Sprint
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date Range */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>
            {format(new Date(sprint.startDate), "MMM d")} -{" "}
            {format(new Date(sprint.endDate), "MMM d, yyyy")}
          </span>
        </div>

        {/* Progress */}
        {sprint.status !== "planning" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Progress
              </span>
              <span className="font-semibold">
                {sprint.completedPoints} / {sprint.committedPoints} points (
                {Math.round(progressPercentage)}%)
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        )}

        {/* Capacity Indicator */}
        {sprint.status === "planning" && (
          <CapacityIndicator
            usedPoints={sprint.committedPoints}
            totalCapacity={sprint.capacity}
          />
        )}

        {/* Sprint Health */}
        {health && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Status:</span>
            <span className={`font-medium ${health.color}`}>{health.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SprintSummary } from "@/types/pm";
import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react";

interface SprintHealthIndicatorProps {
  summary: SprintSummary;
}

type HealthStatus = "on-track" | "at-risk" | "behind";

interface HealthConfig {
  status: HealthStatus;
  label: string;
  icon: React.ReactNode;
  color: string;
  badgeVariant: "default" | "secondary" | "destructive" | "outline";
  reason: string;
}

function SprintHealthIndicatorComponent({ summary }: SprintHealthIndicatorProps) {
  // Calculate health status
  const calculateHealth = (): HealthConfig => {
    const { percentageCompleted, daysRemaining, totalDays, isOverCapacity, scopeCreep } = summary;

    // Calculate expected progress (time-based)
    const daysElapsed = totalDays - daysRemaining;
    const expectedProgress = totalDays > 0 ? (daysElapsed / totalDays) * 100 : 0;
    const progressDeviation = percentageCompleted - expectedProgress;

    // Determine health status
    if (isOverCapacity) {
      return {
        status: "at-risk",
        label: "At Risk",
        icon: <AlertTriangle className="h-5 w-5" />,
        color: "text-amber-600",
        badgeVariant: "secondary",
        reason: `Sprint is over capacity by ${summary.committedPoints - summary.capacity} points`,
      };
    }

    if (scopeCreep > 10) {
      return {
        status: "at-risk",
        label: "At Risk",
        icon: <AlertTriangle className="h-5 w-5" />,
        color: "text-amber-600",
        badgeVariant: "secondary",
        reason: `High scope creep: ${scopeCreep} points added mid-sprint`,
      };
    }

    // Progress vs time-based check
    if (progressDeviation < -15) {
      return {
        status: "behind",
        label: "Behind Schedule",
        icon: <AlertCircle className="h-5 w-5" />,
        color: "text-red-600",
        badgeVariant: "destructive",
        reason: `${Math.abs(Math.round(progressDeviation))}% behind expected progress`,
      };
    }

    if (progressDeviation < -5) {
      return {
        status: "at-risk",
        label: "At Risk",
        icon: <AlertTriangle className="h-5 w-5" />,
        color: "text-amber-600",
        badgeVariant: "secondary",
        reason: `${Math.abs(Math.round(progressDeviation))}% behind expected progress`,
      };
    }

    // Check if nearing end with low completion
    if (daysRemaining <= 2 && percentageCompleted < 80) {
      return {
        status: "at-risk",
        label: "At Risk",
        icon: <AlertTriangle className="h-5 w-5" />,
        color: "text-amber-600",
        badgeVariant: "secondary",
        reason: `Only ${daysRemaining} days left with ${percentageCompleted}% complete`,
      };
    }

    // All good
    return {
      status: "on-track",
      label: "On Track",
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: "text-green-600",
      badgeVariant: "outline",
      reason: `Sprint is progressing as expected (${percentageCompleted}% complete)`,
    };
  };

  const health = calculateHealth();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`rounded-lg p-3 ${health.color}`}>{health.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold">Sprint Health</h3>
              <Badge variant={health.badgeVariant}>{health.label}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{health.reason}</p>

            {/* Additional metrics */}
            <div className="mt-4 grid grid-cols-3 gap-4 border-t pt-4">
              <div>
                <div className="text-xs text-muted-foreground">Progress</div>
                <div className="text-lg font-semibold">{summary.percentageCompleted}%</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Days Left</div>
                <div className="text-lg font-semibold">{summary.daysRemaining}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Completed</div>
                <div className="text-lg font-semibold">
                  {summary.completedPoints}/{summary.committedPoints}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const SprintHealthIndicator = memo(SprintHealthIndicatorComponent);

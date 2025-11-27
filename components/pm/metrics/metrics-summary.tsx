"use client";

import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { SprintSummary } from "@/types/pm";
import {
  Target,
  Clock,
  TrendingUp,
  CheckCircle2,
  ListTodo,
  Bug,
  Timer,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface MetricsSummaryProps {
  summary: SprintSummary;
  previousSummary?: SprintSummary | null;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

function MetricCard({
  icon,
  label,
  value,
  trend,
  trendValue,
  variant = "default",
}: MetricCardProps) {
  const variantClasses = {
    default: "bg-card",
    success: "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
    warning: "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900",
    danger: "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900",
  };

  const iconColorClasses = {
    default: "text-muted-foreground",
    success: "text-green-600 dark:text-green-400",
    warning: "text-amber-600 dark:text-amber-400",
    danger: "text-red-600 dark:text-red-400",
  };

  return (
    <Card className={variantClasses[variant]}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className={`rounded-lg p-2 ${iconColorClasses[variant]}`}>{icon}</div>
          {trend && trendValue && (
            <div
              className={`flex items-center gap-1 text-xs ${
                trend === "up"
                  ? "text-green-600"
                  : trend === "down"
                  ? "text-red-600"
                  : "text-muted-foreground"
              }`}
            >
              {trend === "up" && <ArrowUp className="h-3 w-3" />}
              {trend === "down" && <ArrowDown className="h-3 w-3" />}
              {trend === "neutral" && <Minus className="h-3 w-3" />}
              {trendValue}
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-2xl font-bold">{value}</div>
          <div className="mt-1 text-sm text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function MetricsSummaryComponent({ summary, previousSummary }: MetricsSummaryProps) {
  // Calculate metrics
  const progressPercentage = summary.percentageCompleted;
  const daysRemaining = summary.daysRemaining;
  const averageVelocity = summary.completedPoints;
  const completionRate = summary.percentageCompleted;

  const totalTasks = summary.tasksTotal;
  const completedTasks = summary.tasksByStatus.done || 0;
  const inProgressTasks = summary.tasksByStatus.in_progress || 0;
  const todoTasks = summary.tasksByStatus.todo || 0;

  const bugCount = summary.tasksByType.bug || 0;
  const bugRatio = totalTasks > 0 ? Math.round((bugCount / totalTasks) * 100) : 0;

  const cycleTime = summary.averageCycleTime;
  const scopeCreep = summary.scopeCreep;

  // Determine variants based on thresholds
  const progressVariant =
    progressPercentage >= 80
      ? "success"
      : progressPercentage >= 50
      ? "warning"
      : "danger";

  const daysRemainingVariant =
    daysRemaining >= 5 ? "success" : daysRemaining >= 2 ? "warning" : "danger";

  const completionVariant =
    completionRate >= 80 ? "success" : completionRate >= 60 ? "warning" : "danger";

  const bugRatioVariant =
    bugRatio <= 15 ? "success" : bugRatio <= 30 ? "warning" : "danger";

  const scopeCreepVariant = scopeCreep === 0 ? "success" : scopeCreep <= 5 ? "warning" : "danger";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        icon={<Target className="h-5 w-5" />}
        label="Sprint Progress"
        value={`${progressPercentage}%`}
        variant={progressVariant}
      />

      <MetricCard
        icon={<Clock className="h-5 w-5" />}
        label="Days Remaining"
        value={daysRemaining}
        variant={daysRemainingVariant}
      />

      <MetricCard
        icon={<TrendingUp className="h-5 w-5" />}
        label="Velocity"
        value={`${averageVelocity} pts`}
        variant="default"
      />

      <MetricCard
        icon={<CheckCircle2 className="h-5 w-5" />}
        label="Completion Rate"
        value={`${completionRate}%`}
        variant={completionVariant}
      />

      <MetricCard
        icon={<ListTodo className="h-5 w-5" />}
        label="Total Tasks"
        value={totalTasks}
        variant="default"
      />

      <MetricCard
        icon={<Bug className="h-5 w-5" />}
        label="Bug Ratio"
        value={`${bugRatio}%`}
        variant={bugRatioVariant}
      />

      <MetricCard
        icon={<Timer className="h-5 w-5" />}
        label="Avg Cycle Time"
        value={cycleTime ? `${cycleTime} days` : "N/A"}
        variant="default"
      />

      <MetricCard
        icon={<AlertTriangle className="h-5 w-5" />}
        label="Scope Creep"
        value={`${scopeCreep} pts`}
        variant={scopeCreepVariant}
      />
    </div>
  );
}

export const MetricsSummary = memo(MetricsSummaryComponent);

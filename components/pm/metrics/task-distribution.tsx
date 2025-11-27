"use client";

import { memo } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Task, TaskType, TaskPriority } from "@/types/pm";
import { LayoutGrid } from "lucide-react";

interface TaskDistributionProps {
  tasks: Task[];
  onTypeClick?: (type: TaskType) => void;
  onPriorityClick?: (priority: TaskPriority) => void;
}

// Color palettes
const TYPE_COLORS: Record<TaskType, string> = {
  story: "#3B82F6", // Blue
  task: "#10B981", // Green
  bug: "#EF4444", // Red
  epic: "#8B5CF6", // Purple
  spike: "#F59E0B", // Amber
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "#DC2626", // Dark Red
  high: "#F59E0B", // Amber
  medium: "#3B82F6", // Blue
  low: "#6B7280", // Gray
};

function TaskDistributionComponent({
  tasks,
  onTypeClick,
  onPriorityClick,
}: TaskDistributionProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Task Distribution</CardTitle>
          <CardDescription>Breakdown by type and priority</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <LayoutGrid className="h-8 w-8" />
            <p>No tasks to analyze</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group by type
  const typeData = tasks.reduce(
    (acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    },
    {} as Record<TaskType, number>
  );

  const typeChartData = Object.entries(typeData).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    percentage: Math.round((count / tasks.length) * 100),
    type: type as TaskType,
  }));

  // Group by priority
  const priorityData = tasks.reduce(
    (acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    },
    {} as Record<TaskPriority, number>
  );

  const priorityChartData = Object.entries(priorityData).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    percentage: Math.round((count / tasks.length) * 100),
    priority: priority as TaskPriority,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* By Type */}
      <Card>
        <CardHeader>
          <CardTitle>By Type</CardTitle>
          <CardDescription>Task distribution by type</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={typeChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onClick={(data) => {
                  if (onTypeClick) {
                    onTypeClick(data.type);
                  }
                }}
              >
                {typeChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={TYPE_COLORS[entry.type]}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="mb-2 text-sm font-medium">{data.name}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-4">
                          <span>Count:</span>
                          <span className="font-medium">{data.value}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span>Percentage:</span>
                          <span className="font-medium">{data.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-3 text-xs">
                    {payload?.map((entry: any, index: number) => (
                      <div key={`legend-${index}`} className="flex items-center gap-1">
                        <div
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span>
                          {entry.value} ({entry.payload.value})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {onTypeClick && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Click on a segment to filter
            </p>
          )}
        </CardContent>
      </Card>

      {/* By Priority */}
      <Card>
        <CardHeader>
          <CardTitle>By Priority</CardTitle>
          <CardDescription>Task distribution by priority</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={priorityChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                onClick={(data) => {
                  if (onPriorityClick) {
                    onPriorityClick(data.priority);
                  }
                }}
              >
                {priorityChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PRIORITY_COLORS[entry.priority]}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg">
                      <div className="mb-2 text-sm font-medium">{data.name}</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-4">
                          <span>Count:</span>
                          <span className="font-medium">{data.value}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span>Percentage:</span>
                          <span className="font-medium">{data.percentage}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                content={({ payload }) => (
                  <div className="flex flex-wrap justify-center gap-3 text-xs">
                    {payload?.map((entry: any, index: number) => (
                      <div key={`legend-${index}`} className="flex items-center gap-1">
                        <div
                          className="h-3 w-3 rounded"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span>
                          {entry.value} ({entry.payload.value})
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {onPriorityClick && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Click on a segment to filter
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export const TaskDistribution = memo(TaskDistributionComponent);

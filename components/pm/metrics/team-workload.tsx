"use client";

import { memo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Task } from "@/types/pm";
import { Users } from "lucide-react";
import { groupTasksByAssignee } from "@/lib/pm-utils";

interface TeamWorkloadProps {
  tasks: Task[];
  users: Array<{ _id: string; name: string; avatarUrl?: string | null }>;
  onUserClick?: (userId: string) => void;
}

function TeamWorkloadComponent({ tasks, users, onUserClick }: TeamWorkloadProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Workload</CardTitle>
          <CardDescription>Tasks distribution across team members</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Users className="h-8 w-8" />
            <p>No task data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group tasks by assignee
  const grouped = groupTasksByAssignee(tasks);

  // Create user map
  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  // Build chart data
  const chartData = Object.entries(grouped)
    .filter(([userId]) => userId !== "unassigned")
    .map(([userId, userTasks]) => {
      const user = userMap.get(userId);
      const userName = user?.name || "Unknown User";

      const statusCounts = {
        todo: 0,
        in_progress: 0,
        in_review: 0,
        in_testing: 0,
        done: 0,
        blocked: 0,
      };

      userTasks.forEach((task) => {
        if (task.status === "todo" || task.status === "backlog") {
          statusCounts.todo++;
        } else if (task.status === "in_progress") {
          statusCounts.in_progress++;
        } else if (task.status === "in_review") {
          statusCounts.in_review++;
        } else if (task.status === "in_testing") {
          statusCounts.in_testing++;
        } else if (task.status === "done") {
          statusCounts.done++;
        } else if (task.status === "blocked") {
          statusCounts.blocked++;
        }
      });

      return {
        userId,
        name: userName.split(" ")[0] || userName, // First name only for chart
        fullName: userName,
        total: userTasks.length,
        ...statusCounts,
      };
    })
    .sort((a, b) => b.total - a.total)
    .slice(0, 10); // Top 10 users

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Workload</CardTitle>
          <CardDescription>Tasks distribution across team members</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Users className="h-8 w-8" />
            <p>No assigned tasks</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Workload</CardTitle>
        <CardDescription>Tasks distribution across team members (top 10)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            onClick={(data) => {
              if (data && data.activePayload && onUserClick) {
                onUserClick(data.activePayload[0].payload.userId);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{ value: "Task Count", angle: -90, position: "insideLeft" }}
              className="text-xs"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <div className="mb-2 text-sm font-medium">{data.fullName}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <span>Total Tasks:</span>
                        <span className="font-medium">{data.total}</span>
                      </div>
                      <div className="mt-2 border-t pt-2">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-slate-500" />
                            <span>To Do:</span>
                          </div>
                          <span>{data.todo}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                            <span>In Progress:</span>
                          </div>
                          <span>{data.in_progress}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-purple-500" />
                            <span>In Review:</span>
                          </div>
                          <span>{data.in_review}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            <span>In Testing:</span>
                          </div>
                          <span>{data.in_testing}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span>Done:</span>
                          </div>
                          <span>{data.done}</span>
                        </div>
                        {data.blocked > 0 && (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-red-500" />
                              <span>Blocked:</span>
                            </div>
                            <span>{data.blocked}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend wrapperStyle={{ paddingTop: "20px" }} />
            <Bar dataKey="todo" stackId="a" fill="#64748B" name="To Do" />
            <Bar dataKey="in_progress" stackId="a" fill="#3B82F6" name="In Progress" />
            <Bar dataKey="in_review" stackId="a" fill="#8B5CF6" name="In Review" />
            <Bar dataKey="in_testing" stackId="a" fill="#F59E0B" name="In Testing" />
            <Bar dataKey="done" stackId="a" fill="#10B981" name="Done" />
            <Bar dataKey="blocked" stackId="a" fill="#EF4444" name="Blocked" />
          </BarChart>
        </ResponsiveContainer>
        {onUserClick && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Click on a bar to filter tasks by user
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export const TeamWorkload = memo(TeamWorkloadComponent);

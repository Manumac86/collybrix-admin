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
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { VelocityData } from "@/types/pm";
import { TrendingUp } from "lucide-react";

interface VelocityChartProps {
  velocityData: VelocityData[];
  averageVelocity: number;
}

function VelocityChartComponent({ velocityData, averageVelocity }: VelocityChartProps) {
  if (!velocityData || velocityData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Velocity</CardTitle>
          <CardDescription>Completed story points per sprint</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="h-8 w-8" />
            <p>No velocity data available</p>
            <p className="text-xs">Complete sprints to see velocity trends</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Map data for chart with color coding
  const chartData = velocityData.map((item) => ({
    name: item.sprintName,
    points: item.completedPoints,
    committed: item.committedPoints,
    completionRate: item.percentageCompleted,
    // Color based on completion rate
    fill:
      item.percentageCompleted >= 80
        ? "#10B981" // Green
        : item.percentageCompleted >= 60
        ? "#F59E0B" // Amber
        : "#EF4444", // Red
  }));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Team Velocity</CardTitle>
            <CardDescription>Completed story points per sprint</CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Average Velocity</div>
            <div className="text-2xl font-bold">{averageVelocity}</div>
            <div className="text-xs text-muted-foreground">points/sprint</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="name"
              className="text-xs"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              label={{ value: "Story Points", angle: -90, position: "insideLeft" }}
              className="text-xs"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="rounded-lg border bg-background p-3 shadow-lg">
                    <div className="mb-2 text-sm font-medium">{data.name}</div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <span>Completed:</span>
                        <span className="font-medium">{data.points} points</span>
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <span>Committed:</span>
                        <span className="font-medium">{data.committed} points</span>
                      </div>
                      <div className="flex items-center justify-between gap-4 border-t pt-1">
                        <span>Completion:</span>
                        <span
                          className={`font-medium ${
                            data.completionRate >= 80
                              ? "text-green-600"
                              : data.completionRate >= 60
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {data.completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              content={() => (
                <div className="flex items-center justify-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-green-500" />
                    <span>80%+ completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-amber-500" />
                    <span>60-80% completion</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-red-500" />
                    <span>&lt;60% completion</span>
                  </div>
                </div>
              )}
            />
            <ReferenceLine
              y={averageVelocity}
              stroke="#6B7280"
              strokeDasharray="3 3"
              label={{
                value: "Avg",
                position: "right",
                className: "text-xs fill-muted-foreground",
              }}
            />
            <Bar dataKey="points" name="Completed Points" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export const VelocityChart = memo(VelocityChartComponent);

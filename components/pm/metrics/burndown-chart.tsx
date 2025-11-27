"use client";

import { memo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BurndownData } from "@/types/pm";
import { AlertCircle } from "lucide-react";

interface BurndownChartProps {
  data: BurndownData;
}

function BurndownChartComponent({ data }: BurndownChartProps) {
  if (!data.dailyData || data.dailyData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Burndown Chart</CardTitle>
          <CardDescription>Track sprint progress vs ideal burndown</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <AlertCircle className="h-8 w-8" />
            <p>No burndown data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate sprint health status
  const latestData = data.dailyData[data.dailyData.length - 1];
  const deviation = latestData.remaining - latestData.ideal;
  const deviationPercentage = data.totalPoints > 0
    ? Math.round((deviation / data.totalPoints) * 100)
    : 0;

  let healthStatus: "On Track" | "At Risk" | "Behind";
  let healthColor: string;

  if (deviationPercentage <= 10) {
    healthStatus = "On Track";
    healthColor = "text-green-600";
  } else if (deviationPercentage <= 25) {
    healthStatus = "At Risk";
    healthColor = "text-amber-600";
  } else {
    healthStatus = "Behind";
    healthColor = "text-red-600";
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Burndown Chart</CardTitle>
            <CardDescription>Track sprint progress vs ideal burndown</CardDescription>
          </div>
          <div className="text-right">
            <div className={`text-sm font-medium ${healthColor}`}>{healthStatus}</div>
            {deviation > 0 && (
              <div className="text-xs text-muted-foreground">
                {Math.abs(Math.round(deviation))} points {deviation > 0 ? "behind" : "ahead"}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.dailyData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
              className="text-xs"
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
                    <div className="mb-2 text-xs font-medium">
                      {new Date(data.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-500" />
                        <span>Actual: {data.remaining} points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-slate-400" />
                        <span>Ideal: {data.ideal} points</span>
                      </div>
                      <div className="mt-1 border-t pt-1 text-muted-foreground">
                        Completed: {data.completed} points
                      </div>
                    </div>
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: "20px" }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#94A3B8"
              strokeDasharray="5 5"
              strokeWidth={2}
              name="Ideal Burndown"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="remaining"
              stroke="#3B82F6"
              strokeWidth={3}
              name="Actual Progress"
              dot={{ fill: "#3B82F6", r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export const BurndownChart = memo(BurndownChartComponent);

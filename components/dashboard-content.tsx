"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProjects, useRevenue } from "@/hooks/projects";
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { RevenueChart } from "./revenue-chart";
import { PipelineStatusChart } from "./pipeline-status-chart";

const RADIAN = Math.PI / 180;

export function DashboardContent() {
  const { projects, isLoading } = useProjects();
  const {
    totalRevenue,
    isLoading: totalRevenueLoading,
    error: totalRevenueError,
  } = useRevenue();

  if (isLoading || !projects) {
    return (
      <div className="p-8">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  // Calculate metrics
  const totalMRR = projects.reduce((sum, p) => sum + (p.mmr || 0), 0);
  const inProgressProjects = projects.filter(
    (p) => p.pipelineState === "in progress"
  ).length;
  const upcomingProjects = projects.filter((p) =>
    [
      "scouting",
      "initial contact",
      "qualification",
      "discovery",
      "technical evaluation",
      "due diligence",
      "presentation",
      "negotiation",
      "terms",
      "closing",
    ].includes(p.pipelineState)
  ).length;
  const finishedProjects = projects.filter(
    (p) => p.pipelineState === "finished"
  ).length;

  // Project type distribution
  const projectTypeData = [
    {
      name: "Software Factory",
      value: projects.filter((p) => p.projectType === "Software Factory")
        .length,
    },
    {
      name: "Accelleration",
      value: projects.filter((p) => p.projectType === "Accelleration").length,
    },
    {
      name: "Consulting",
      value: projects.filter((p) => p.projectType === "Consulting").length,
    },
    {
      name: "SaaS",
      value: projects.filter((p) => p.projectType === "SaaS").length,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome back to Collybrix - Your project management overview
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{totalRevenue?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              €{totalMRR?.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">Total MRR</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressProjects}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Projects currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Upcoming
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingProjects}</div>
            <p className="text-xs text-muted-foreground mt-2">
              In pipeline stages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedProjects}</div>
            <p className="text-xs text-muted-foreground mt-2">
              Projects finished
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>
              Revenue trend for the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        {/* Project Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Project Types</CardTitle>
            <CardDescription>Distribution of project types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={projectTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill={"var(--chart-2)"}
                  dataKey="value"
                >
                  {projectTypeData.map((item, index) => (
                    <Cell key={item.name} fill={`var(--chart-${index + 1})`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: `1px solid var(--border)`,
                    borderRadius: "8px",
                    color: "var(--chart-5)",
                  }}
                  labelStyle={{ color: "var(--chart-2)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Status</CardTitle>
          <CardDescription>
            Distribution of projects by pipeline stage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PipelineStatusChart />
        </CardContent>
      </Card>
    </div>
  );
}

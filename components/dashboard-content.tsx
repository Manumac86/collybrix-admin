"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { projectsData } from "@/lib/data"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

export function DashboardContent() {
  // Calculate metrics
  const totalMMR = projectsData.reduce((sum, p) => sum + (p.mmr || 0), 0)
  const inProgressProjects = projectsData.filter((p) => p.pipelineState === "in progress").length
  const upcomingProjects = projectsData.filter((p) =>
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
    ].includes(p.pipelineState),
  ).length
  const finishedProjects = projectsData.filter((p) => p.pipelineState === "finished").length

  // Monthly revenue data (example)
  const monthlyRevenueData = [
    { month: "Jan", revenue: 5000 },
    { month: "Feb", revenue: 8500 },
    { month: "Mar", revenue: 7200 },
    { month: "Apr", revenue: 9800 },
    { month: "May", revenue: 11200 },
    { month: "Jun", revenue: totalMMR * 2 },
  ]

  // Project type distribution
  const projectTypeData = [
    { name: "Software Factory", value: projectsData.filter((p) => p.projectType === "Software Factory").length },
    { name: "Accelleration", value: projectsData.filter((p) => p.projectType === "Accelleration").length },
    { name: "Consulting", value: projectsData.filter((p) => p.projectType === "Consulting").length },
    { name: "SaaS", value: projectsData.filter((p) => p.projectType === "SaaS").length },
  ]

  const colors = [
    "hsl(var(--color-chart-1))",
    "hsl(var(--color-chart-2))",
    "hsl(var(--color-chart-3))",
    "hsl(var(--color-chart-4))",
  ]

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back to Collybrix - Your project management overview</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total MMR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{totalMMR.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-2">Monthly recurring revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressProjects}</div>
            <p className="text-xs text-muted-foreground mt-2">Projects currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingProjects}</div>
            <p className="text-xs text-muted-foreground mt-2">In pipeline stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedProjects}</div>
            <p className="text-xs text-muted-foreground mt-2">Projects finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
            <CardDescription>Revenue trend for the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--color-primary))"
                  strokeWidth={2}
                  name="Revenue (€)"
                />
              </LineChart>
            </ResponsiveContainer>
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
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {colors.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Status</CardTitle>
          <CardDescription>Distribution of projects by pipeline stage</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                {
                  stage: "Scouting",
                  count: projectsData.filter((p) => p.pipelineState === "scouting").length,
                },
                {
                  stage: "Qualification",
                  count: projectsData.filter((p) => p.pipelineState === "qualification").length,
                },
                {
                  stage: "Discovery",
                  count: projectsData.filter((p) => p.pipelineState === "discovery").length,
                },
                {
                  stage: "Evaluation",
                  count: projectsData.filter((p) => p.pipelineState === "technical evaluation").length,
                },
                {
                  stage: "In Progress",
                  count: projectsData.filter((p) => p.pipelineState === "in progress").length,
                },
                {
                  stage: "Finished",
                  count: projectsData.filter((p) => p.pipelineState === "finished").length,
                },
              ]}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(var(--color-primary))" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

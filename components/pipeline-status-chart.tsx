import { useProjectPipelineStatusDistribution } from "@/hooks/projects";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { ChartContainer } from "./ui/chart";

export function PipelineStatusChart() {
  const { projectPipelineStatusDistributionData, isLoading, error } =
    useProjectPipelineStatusDistribution();
  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  if (!projectPipelineStatusDistributionData) {
    return <div>No data</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartContainer
        className="w-full h-full"
        config={{
          pipeline: { color: "var(--chart-3)", label: "Pipeline Status" },
        }}
      >
        <BarChart data={projectPipelineStatusDistributionData}>
          <CartesianGrid strokeDasharray="3 3" stroke={"var(--chart-3)"} />
          <XAxis
            dataKey="stage"
            angle={-45}
            textAnchor="end"
            height={100}
            stroke={"var(--muted-foreground)"}
          />
          <YAxis stroke="var(--muted-foreground)" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--card)",
              border: `1px solid var(--border)`,
              borderRadius: "8px",
              color: "var(--chart-5)",
            }}
            labelStyle={{ color: "var(--chart-2)" }}
          />
          <Bar dataKey="count" fill={"var(--chart-2)"}>
            {projectPipelineStatusDistributionData?.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`var(--chart-${index + 1})`} />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}

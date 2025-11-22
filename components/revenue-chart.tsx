import {
  CartesianGrid,
  Dot,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import { useRevenue } from "@/hooks/projects";

export function RevenueChart() {
  const { monthlyRevenueData, isLoading, error } = useRevenue();

  // We want to return an array like monthlyRevenueData, but 'revenue' becomes cumulative sum.
  const data = Array.isArray(monthlyRevenueData)
    ? monthlyRevenueData.reduce(
        (
          acc: { month: string; revenue: number }[],
          curr: { month: string; revenue: number }
        ) => {
          const prevRevenue = acc.length > 0 ? acc[acc.length - 1].revenue : 0;
          acc.push({
            ...curr,
            revenue: prevRevenue + curr.revenue,
          });
          return acc;
        },
        []
      )
    : [];

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <ChartContainer
        className="w-full h-full"
        config={{
          revenue: {
            color: "var(--chart-5)",
            label: "Monthly Revenue",
          },
        }}
      >
        <LineChart
          accessibilityLayer
          data={data}
          margin={{
            top: 24,
            left: 24,
            right: 24,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) =>
              value.slice(0, 3) + " " + value.slice(6, 8)
            }
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel />}
          />
          <Line
            dataKey="revenue"
            type="natural"
            stroke="var(--chart-2)"
            strokeWidth={2}
            dot={({ payload, ...props }) => {
              return (
                <Dot
                  key={payload.month}
                  r={5}
                  cx={props.cx}
                  cy={props.cy}
                  fill="var(--chart-2)"
                  stroke="var(--chart-2)"
                />
              );
            }}
          />
        </LineChart>
      </ChartContainer>
    </ResponsiveContainer>
  );
}

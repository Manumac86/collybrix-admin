# Metrics Dashboard - Phase 6

## Overview

The Metrics Dashboard provides comprehensive analytics and visualization for sprint and project performance tracking. It includes burndown charts, velocity tracking, team workload analysis, and various KPIs to help project managers make data-driven decisions.

## Features

### 1. Sprint Metrics
- **Sprint Health Indicator**: Real-time health status (On Track, At Risk, Behind)
- **Burndown Chart**: Visual tracking of story points vs. ideal burndown
- **KPI Summary Cards**: 8 key performance indicators with color-coded alerts
- **Sprint Progress**: Percentage completion with trend indicators

### 2. Team Metrics
- **Team Workload Chart**: Stacked bar chart showing task distribution per user
- **Epic Progress**: Track completion of epics with progress bars
- **Task Assignment**: View who's working on what

### 3. Task Distribution
- **By Type**: Pie chart showing distribution of stories, tasks, bugs, epics, and spikes
- **By Priority**: Pie chart showing critical, high, medium, and low priority distribution
- **Interactive Filtering**: Click on segments to filter tasks

### 4. Velocity Tracking
- **Velocity Chart**: Historical view of completed points per sprint
- **Average Velocity**: Calculate team's average velocity
- **Completion Rate**: Visual indication of sprint commitments vs. completions

### 5. Project Overview
- **Total Tasks & Story Points**: Aggregate project metrics
- **Bug Ratio**: Track bug percentage
- **Sprint Statistics**: Active and completed sprints count

## API Endpoints

### GET /api/pm/metrics/burndown
Fetch burndown chart data for a sprint.

**Query Parameters:**
- `sprintId` (required): Sprint ID

**Response:**
```typescript
{
  success: true,
  data: {
    sprintId: string,
    sprintName: string,
    startDate: Date,
    endDate: Date,
    totalPoints: number,
    dailyData: [
      {
        date: string,
        remaining: number,
        ideal: number,
        completed: number
      }
    ]
  }
}
```

### GET /api/pm/metrics/velocity
Fetch velocity data for recent sprints.

**Query Parameters:**
- `projectId` (required): Project ID
- `sprintCount` (optional): Number of sprints to fetch (default: 6)

**Response:**
```typescript
{
  success: true,
  data: {
    velocityData: VelocityData[],
    averageVelocity: number,
    sprintCount: number
  }
}
```

### GET /api/pm/metrics/summary
Fetch comprehensive sprint or project summary.

**Query Parameters:**
- `sprintId` (optional): For sprint summary
- `projectId` (optional): For project summary

**Response (Sprint):**
```typescript
{
  success: true,
  data: SprintSummary
}
```

**Response (Project):**
```typescript
{
  success: true,
  data: ProjectSummary
}
```

## Components

### BurndownChart
Displays ideal vs actual burndown for a sprint.

**Props:**
- `data: BurndownData` - Burndown data from API

**Features:**
- Real-time health status indicator
- Hover tooltips with detailed data
- Responsive design

### VelocityChart
Shows completed story points per sprint with average line.

**Props:**
- `velocityData: VelocityData[]` - Historical velocity data
- `averageVelocity: number` - Average velocity across sprints

**Features:**
- Color-coded bars by completion rate
- Average velocity reference line
- Interactive tooltips

### MetricsSummary
Grid of 8 KPI cards with color-coded alerts.

**Props:**
- `summary: SprintSummary` - Sprint summary data
- `previousSummary?: SprintSummary` - Optional for trend comparison

**Metrics:**
1. Sprint Progress (%)
2. Days Remaining
3. Velocity (points)
4. Completion Rate (%)
5. Total Tasks
6. Bug Ratio (%)
7. Average Cycle Time (days)
8. Scope Creep (points)

### TeamWorkload
Stacked bar chart showing tasks per user by status.

**Props:**
- `tasks: Task[]` - All tasks
- `users: User[]` - Team members
- `onUserClick?: (userId: string) => void` - Click handler

**Features:**
- Click to filter tasks by user
- Top 10 users displayed
- Status breakdown in tooltips

### TaskDistribution
Two pie charts: by type and by priority.

**Props:**
- `tasks: Task[]` - All tasks
- `onTypeClick?: (type: TaskType) => void` - Click handler
- `onPriorityClick?: (priority: TaskPriority) => void` - Click handler

**Features:**
- Interactive segments
- Percentage labels
- Legend with counts

### SprintHealthIndicator
Visual health status with detailed metrics.

**Props:**
- `summary: SprintSummary` - Sprint summary data

**Health Logic:**
- **On Track**: Progress aligns with time, no major issues
- **At Risk**: 5-15% behind schedule, or high scope creep
- **Behind**: >15% behind schedule, or critical issues

### EpicProgress
List of epics with progress bars.

**Props:**
- `tasks: Task[]` - All tasks (including epics)
- `onEpicClick?: (epicId: string) => void` - Click handler

**Features:**
- Progress bar per epic
- Task and story point counts
- Hover effects

## Hooks

### useVelocity(projectId, sprintCount?)
Fetch velocity data for recent sprints.

**Returns:**
- `velocityData: VelocityData[]`
- `averageVelocity: number`
- `sprintCount: number`
- `isLoading: boolean`
- `error: string | undefined`
- `mutate: () => void`

### useBurndown(sprintId)
Fetch burndown data for a sprint.

**Returns:**
- `burndownData: BurndownData | undefined`
- `isLoading: boolean`
- `error: string | undefined`
- `mutate: () => void`

### useSprintSummary(sprintId)
Fetch comprehensive sprint metrics.

**Returns:**
- `summary: SprintSummary | undefined`
- `isLoading: boolean`
- `error: string | undefined`
- `mutate: () => void`

### useProjectSummary(projectId)
Fetch project-level metrics.

**Returns:**
- `summary: ProjectSummary | undefined`
- `isLoading: boolean`
- `error: string | undefined`
- `mutate: () => void`

## Auto-Refresh

All metrics hooks use SWR with 30-second auto-refresh:
```typescript
refreshInterval: 30000 // 30 seconds
```

This ensures dashboards stay up-to-date without manual refresh.

## Performance Optimizations

1. **Memoization**: All chart components use `React.memo()`
2. **Lazy Loading**: Charts below fold are lazy-loaded
3. **SWR Caching**: Prevents redundant API calls
4. **Debouncing**: Filter changes are debounced
5. **Responsive**: Charts resize automatically

## Accessibility

- **ARIA Labels**: All charts have proper labels
- **Keyboard Navigation**: Full keyboard support
- **Screen Reader**: Compatible with screen readers
- **Color Contrast**: WCAG AA compliant

## Usage Example

```typescript
import { MetricsSummary, BurndownChart, VelocityChart } from "@/components/pm/metrics";
import { useSprintSummary, useBurndown, useVelocity } from "@/hooks/pm";

function MyMetricsDashboard({ sprintId, projectId }) {
  const { summary } = useSprintSummary(sprintId);
  const { burndownData } = useBurndown(sprintId);
  const { velocityData, averageVelocity } = useVelocity(projectId);

  if (!summary) return <div>Loading...</div>;

  return (
    <div>
      <MetricsSummary summary={summary} />
      {burndownData && <BurndownChart data={burndownData} />}
      <VelocityChart velocityData={velocityData} averageVelocity={averageVelocity} />
    </div>
  );
}
```

## Color Palette (Collybrix)

Charts use consistent Collybrix colors:

**Status Colors:**
- Blue: `#3B82F6` (In Progress)
- Green: `#10B981` (Done/Success)
- Amber: `#F59E0B` (In Testing/Warning)
- Red: `#EF4444` (Blocked/Danger)
- Purple: `#8B5CF6` (In Review)
- Gray: `#6B7280` (To Do/Low Priority)

**Priority Colors:**
- Critical: `#DC2626`
- High: `#F59E0B`
- Medium: `#3B82F6`
- Low: `#6B7280`

## Future Enhancements

1. **Export to PDF/CSV**: Generate downloadable reports
2. **Comparison Mode**: Compare sprints side-by-side
3. **Forecast**: Predict completion dates
4. **Custom Date Ranges**: Filter by date
5. **Embed Mode**: Embed charts in other pages
6. **Historical Trends**: Long-term trend analysis
7. **Custom Dashboards**: User-configurable layouts
8. **Email Reports**: Scheduled metric reports

## Troubleshooting

**No data showing:**
- Ensure sprint has tasks assigned
- Check that tasks have story points
- Verify sprint dates are valid

**Chart not rendering:**
- Check browser console for errors
- Ensure Recharts is installed
- Verify data structure matches types

**Slow loading:**
- Check network tab for API response times
- Consider increasing SWR cache duration
- Optimize MongoDB queries with indexes

## Testing

To test the metrics dashboard:

1. Create a sprint with tasks
2. Assign story points to tasks
3. Mark some tasks as done
4. Navigate to `/project-management/[projectId]/metrics`
5. Select the sprint from dropdown
6. Verify all charts render correctly

## Dependencies

- `recharts`: ^2.15.4
- `swr`: latest
- `date-fns`: ^4.1.0
- `lucide-react`: ^0.454.0

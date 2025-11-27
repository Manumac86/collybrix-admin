"use client";

import { useState, useMemo, use } from "react";
import { ArrowRight, Search, Filter, Loader2, GripVertical } from "lucide-react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSprint, useSprintTasks, useTasks, usePatchTask } from "@/hooks/pm";
import { Task, TaskType, TaskPriority, TASK_TYPES, TASK_PRIORITIES } from "@/types/pm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CapacityIndicator } from "@/components/pm/sprint/capacity-indicator";
import { SprintHeader } from "@/components/pm/sprint/sprint-header";
import { SprintPlanningProvider } from "@/components/pm/sprint/sprint-planning-context";
import { toast } from "sonner";

interface SprintPlanningPageProps {
  params: Promise<{
    projectId: string;
    sprintId: string;
  }>;
}

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
};

const TYPE_COLORS: Record<TaskType, string> = {
  story: "bg-blue-100 text-blue-800 border-blue-300",
  task: "bg-gray-100 text-gray-800 border-gray-300",
  bug: "bg-red-100 text-red-800 border-red-300",
  epic: "bg-purple-100 text-purple-800 border-purple-300",
  spike: "bg-indigo-100 text-indigo-800 border-indigo-300",
};

/**
 * DraggableTaskCard Component for Sprint Planning
 */
function DraggableTaskCard({
  task,
  onMoveToSprint,
  onMoveToBacklog,
  isInSprint,
}: {
  task: Task;
  onMoveToSprint?: () => void;
  onMoveToBacklog?: () => void;
  isInSprint: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div
              className="flex items-start gap-2 flex-1 min-w-0 cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <CardTitle className="text-sm font-medium line-clamp-2">
                {task.title}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {task.storyPoints && (
                <Badge variant="outline" className="font-semibold">
                  {task.storyPoints}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={TYPE_COLORS[task.type]}>{task.type}</Badge>
            <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
          </div>

          {isInSprint ? (
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={onMoveToBacklog}
            >
              Remove from Sprint
            </Button>
          ) : (
            <Button size="sm" className="w-full" onClick={onMoveToSprint}>
              <ArrowRight className="h-4 w-4 mr-2" />
              Add to Sprint
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * TaskCard Component for Drag Overlay
 */
function TaskCard({ task }: { task: Task }) {
  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-sm font-medium line-clamp-2">
              {task.title}
            </CardTitle>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {task.storyPoints && (
              <Badge variant="outline" className="font-semibold">
                {task.storyPoints}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={TYPE_COLORS[task.type]}>{task.type}</Badge>
          <Badge className={PRIORITY_COLORS[task.priority]}>{task.priority}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * SprintPlanningPage Component
 *
 * TWO-COLUMN LAYOUT: Backlog (left) | Sprint (right)
 * - Backlog Side: List of unassigned tasks with search and filter
 * - Sprint Side: Sprint header with capacity bar and assigned tasks
 * - Click buttons to move tasks between backlog and sprint
 *
 * Usage: /project-management/[projectId]/sprints/[sprintId]/planning
 */
export default function SprintPlanningPage({ params }: SprintPlanningPageProps) {
  const { projectId, sprintId } = use(params);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<TaskType | "all">("all");
  const [filterPriority, setFilterPriority] = useState<TaskPriority | "all">("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const { sprint, isLoading: isLoadingSprint } = useSprint(sprintId);
  const { tasks: sprintTasks, isLoading: isLoadingSprintTasks, mutate: mutateSprintTasks } = useSprintTasks(sprintId);
  const { tasks: backlogTasks, isLoading: isLoadingBacklog, mutate: mutateBacklog } = useTasks(projectId, { sprintId: null });
  const { trigger: patchTask } = usePatchTask(null);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    })
  );

  // Calculate used points
  const usedPoints = useMemo(() => {
    return sprintTasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
  }, [sprintTasks]);

  // Filter backlog tasks
  const filteredBacklogTasks = useMemo(() => {
    return backlogTasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === "all" || task.type === filterType;
      const matchesPriority =
        filterPriority === "all" || task.priority === filterPriority;

      return matchesSearch && matchesType && matchesPriority;
    });
  }, [backlogTasks, searchQuery, filterType, filterPriority]);

  const handleMoveToSprint = async (taskId: string) => {
    try {
      const response = await fetch(`/api/pm/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprintId }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Failed to add task");
      }

      toast.success("Task added to sprint");
      mutateSprintTasks();
      mutateBacklog();
    } catch (error) {
      console.error("[Sprint Planning] Failed to add task to sprint:", error);
      toast.error("Failed to add task to sprint");
    }
  };

  const handleMoveToBacklog = async (taskId: string) => {
    try {
      await fetch(`/api/pm/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprintId: null }),
      });

      toast.success("Task removed from sprint");
      mutateSprintTasks();
      mutateBacklog();
    } catch (error) {
      toast.error("Failed to remove task from sprint");
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Determine if task is currently in sprint or backlog
    const isInSprint = sprintTasks.some((t) => t._id.toString() === taskId);
    const isOverSprint = overId === "sprint-container" ||
                         sprintTasks.some((t) => t._id.toString() === overId);

    // If dragging from backlog to sprint
    if (!isInSprint && isOverSprint) {
      await handleMoveToSprint(taskId);
    }
    // If dragging from sprint to backlog
    else if (isInSprint && !isOverSprint) {
      await handleMoveToBacklog(taskId);
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Get the active task for drag overlay
  const activeTask = useMemo(() => {
    if (!activeId) return null;
    return (
      sprintTasks.find((t) => t._id.toString() === activeId) ||
      backlogTasks.find((t) => t._id.toString() === activeId) ||
      null
    );
  }, [activeId, sprintTasks, backlogTasks]);

  const handleCommitSprint = async () => {
    if (!sprint) return;

    try {
      await fetch(`/api/pm/sprints/${sprintId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "active",
          committedPoints: usedPoints,
        }),
      });

      toast.success("Sprint committed and started!");
      window.location.href = `/project-management/${projectId}/sprints/${sprintId}`;
    } catch (error) {
      toast.error("Failed to commit sprint");
    }
  };

  if (isLoadingSprint) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!sprint) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Sprint not found</p>
      </div>
    );
  }

  return (
    <SprintPlanningProvider>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="space-y-6">
          {/* Sprint Header */}
          <SprintHeader sprint={sprint} />

        {/* Capacity Indicator */}
        <Card>
          <CardHeader>
            <CardTitle>Sprint Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <CapacityIndicator usedPoints={usedPoints} totalCapacity={sprint.capacity} />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleCommitSprint}
                disabled={usedPoints === 0}
              >
                Commit Sprint
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Backlog Column */}
          <Card>
            <CardHeader>
              <CardTitle>Backlog</CardTitle>
              <p className="text-sm text-muted-foreground">
                Unassigned tasks ({filteredBacklogTasks.length})
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search and Filters */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex gap-2">
                  <Select
                    value={filterType}
                    onValueChange={(value) => setFilterType(value as typeof filterType)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      {TASK_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filterPriority}
                    onValueChange={(value) => setFilterPriority(value as typeof filterPriority)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {TASK_PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Task List */}
              {isLoadingBacklog ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredBacklogTasks.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">No tasks in backlog</p>
                </div>
              ) : (
                <SortableContext
                  items={filteredBacklogTasks.map((t) => t._id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    id="backlog-container"
                    className="space-y-2 max-h-[600px] overflow-y-auto"
                  >
                    {filteredBacklogTasks.map((task) => (
                      <DraggableTaskCard
                        key={task._id.toString()}
                        task={task}
                        isInSprint={false}
                        onMoveToSprint={() => handleMoveToSprint(task._id.toString())}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </CardContent>
          </Card>

          {/* Sprint Column */}
          <Card>
            <CardHeader>
              <CardTitle>Sprint Tasks</CardTitle>
              <p className="text-sm text-muted-foreground">
                {sprintTasks.length} tasks ({usedPoints} points)
              </p>
            </CardHeader>
            <CardContent>
              {isLoadingSprintTasks ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : sprintTasks.length === 0 ? (
                <div
                  id="sprint-container"
                  className="text-center py-8 border-2 border-dashed rounded-lg min-h-[200px] flex items-center justify-center"
                >
                  <div>
                    <p className="text-sm text-muted-foreground">
                      No tasks in sprint yet
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Drag tasks from the backlog or click "Add to Sprint"
                    </p>
                  </div>
                </div>
              ) : (
                <SortableContext
                  items={sprintTasks.map((t) => t._id.toString())}
                  strategy={verticalListSortingStrategy}
                >
                  <div
                    id="sprint-container"
                    className="space-y-2 max-h-[600px] overflow-y-auto"
                  >
                    {sprintTasks.map((task) => (
                      <DraggableTaskCard
                        key={task._id.toString()}
                        task={task}
                        isInSprint={true}
                        onMoveToBacklog={() => handleMoveToBacklog(task._id.toString())}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
    </SprintPlanningProvider>
  );
}

"use client";

import { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Task } from "@/types/pm";
import { Layers, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EpicProgressProps {
  tasks: Task[];
  onEpicClick?: (epicId: string) => void;
}

interface EpicData {
  id: string;
  title: string;
  totalTasks: number;
  completedTasks: number;
  percentage: number;
  storyPoints: number;
  completedPoints: number;
}

function EpicProgressComponent({ tasks, onEpicClick }: EpicProgressProps) {
  if (!tasks || tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Epic Progress</CardTitle>
          <CardDescription>Track progress of epics</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Layers className="h-8 w-8" />
            <p>No epics found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find all epics
  const epics = tasks.filter((task) => task.type === "epic");

  if (epics.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Epic Progress</CardTitle>
          <CardDescription>Track progress of epics</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <Layers className="h-8 w-8" />
            <p>No epics in this sprint</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate progress for each epic
  const epicData: EpicData[] = epics.map((epic) => {
    const subtasks = tasks.filter((task) => task.parentId?.toString() === epic._id.toString());
    const completedSubtasks = subtasks.filter((task) => task.status === "done");

    const totalPoints = subtasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0);
    const completedPoints = completedSubtasks.reduce(
      (sum, task) => sum + (task.storyPoints || 0),
      0
    );

    const percentage =
      subtasks.length > 0 ? Math.round((completedSubtasks.length / subtasks.length) * 100) : 0;

    return {
      id: epic._id.toString(),
      title: epic.title,
      totalTasks: subtasks.length,
      completedTasks: completedSubtasks.length,
      percentage,
      storyPoints: totalPoints,
      completedPoints,
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Epic Progress</CardTitle>
        <CardDescription>Track progress of epics ({epics.length})</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {epicData.map((epic) => (
            <div
              key={epic.id}
              className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <h4 className="font-medium">{epic.title}</h4>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {epic.completedTasks} of {epic.totalTasks} tasks
                      </span>
                      <span>{epic.percentage}%</span>
                    </div>
                    <Progress value={epic.percentage} className="h-2" />
                    {epic.storyPoints > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {epic.completedPoints} / {epic.storyPoints} story points
                      </div>
                    )}
                  </div>
                </div>
                {onEpicClick && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => onEpicClick(epic.id)}
                    aria-label={`View ${epic.title} tasks`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export const EpicProgress = memo(EpicProgressComponent);

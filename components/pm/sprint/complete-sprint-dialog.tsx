"use client";

import { useState } from "react";
import { Loader2, AlertTriangle, Plus } from "lucide-react";
import { Task, Sprint } from "@/types/pm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CompleteSprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint: Sprint;
  unfinishedTasks: Task[];
  availableSprints: Sprint[];
  projectId: string;
  onComplete: () => Promise<void>;
  onCreateNewSprint?: (sprintData: {
    name: string;
    goal: string;
    startDate: Date;
    endDate: Date;
    capacity: number;
  }) => Promise<{ _id: string }>;
}

/**
 * CompleteSprintDialog Component
 *
 * Modal that appears when completing a sprint with unfinished tasks.
 * Allows user to:
 * - Move unfinished tasks to an existing sprint (active or planning)
 * - Create a new sprint and move tasks there
 * - Leave tasks unassigned (move to backlog)
 *
 * @example
 * <CompleteSprintDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   sprint={currentSprint}
 *   unfinishedTasks={tasks.filter(t => t.status !== 'done')}
 *   availableSprints={sprints.filter(s => ['active', 'planning'].includes(s.status))}
 *   projectId={projectId}
 *   onComplete={handleComplete}
 *   onCreateNewSprint={handleCreateSprint}
 * />
 */
export function CompleteSprintDialog({
  open,
  onOpenChange,
  sprint,
  unfinishedTasks,
  availableSprints,
  projectId,
  onComplete,
  onCreateNewSprint,
}: CompleteSprintDialogProps) {
  const [selectedOption, setSelectedOption] = useState<"existing" | "new" | "backlog">("existing");
  const [selectedSprintId, setSelectedSprintId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  const unfinishedPoints = unfinishedTasks.reduce(
    (sum, task) => sum + (task.storyPoints || 0),
    0
  );

  const handleComplete = async () => {
    if (selectedOption === "existing" && !selectedSprintId) {
      toast.error("Please select a sprint");
      return;
    }

    setIsProcessing(true);
    const toastId = toast.loading("Completing sprint...");

    try {
      // Move unfinished tasks
      if (unfinishedTasks.length > 0) {
        if (selectedOption === "new") {
          // Create new sprint
          if (!onCreateNewSprint) {
            throw new Error("Create sprint handler not provided");
          }

          const nextSprintNumber = parseInt(sprint.name.match(/\d+$/)?.[0] || "0") + 1;
          const endDate = new Date(sprint.endDate);
          const startDate = new Date(endDate);
          startDate.setDate(startDate.getDate() + 1);
          const newEndDate = new Date(startDate);
          newEndDate.setDate(newEndDate.getDate() + 14); // 2 weeks

          const newSprint = await onCreateNewSprint({
            name: `Sprint ${nextSprintNumber}`,
            goal: `Continuation of ${sprint.name} - Complete remaining work`,
            startDate,
            endDate: newEndDate,
            capacity: sprint.capacity,
          });

          // Move tasks to new sprint
          await moveTasks(unfinishedTasks, newSprint._id);
          toast.success(`Created ${newSprint._id} and moved ${unfinishedTasks.length} tasks`, {
            id: toastId,
          });
        } else if (selectedOption === "existing") {
          // Move to selected sprint
          await moveTasks(unfinishedTasks, selectedSprintId);
          const targetSprint = availableSprints.find(
            (s) => s._id.toString() === selectedSprintId
          );
          toast.success(
            `Moved ${unfinishedTasks.length} tasks to ${targetSprint?.name || "selected sprint"}`,
            { id: toastId }
          );
        } else {
          // Move to backlog (remove sprint assignment)
          await moveTasks(unfinishedTasks, null);
          toast.success(`Moved ${unfinishedTasks.length} tasks to backlog`, { id: toastId });
        }
      }

      // Complete the sprint
      await onComplete();
      toast.success(`${sprint.name} completed successfully`, { id: toastId });
      onOpenChange(false);
    } catch (error) {
      console.error("[Complete Sprint] Error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to complete sprint",
        { id: toastId }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const moveTasks = async (tasks: Task[], targetSprintId: string | null) => {
    for (const task of tasks) {
      const response = await fetch(`/api/pm/tasks/${task._id.toString()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sprintId: targetSprintId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to move task");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Complete {sprint.name}</DialogTitle>
          <DialogDescription>
            This sprint has {unfinishedTasks.length} unfinished task
            {unfinishedTasks.length !== 1 ? "s" : ""} ({unfinishedPoints} story points).
            What would you like to do with them?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Unfinished Tasks Summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-amber-900">
                  {unfinishedTasks.length} Unfinished Tasks
                </p>
                <div className="flex flex-wrap gap-2">
                  {unfinishedTasks.slice(0, 3).map((task) => (
                    <Badge key={task._id.toString()} variant="outline" className="text-xs">
                      {task.title}
                    </Badge>
                  ))}
                  {unfinishedTasks.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{unfinishedTasks.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Label>Where should these tasks go?</Label>

            {/* Option 1: Move to existing sprint */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="option-existing"
                  value="existing"
                  checked={selectedOption === "existing"}
                  onChange={() => setSelectedOption("existing")}
                  className="h-4 w-4"
                  disabled={availableSprints.length === 0}
                />
                <Label htmlFor="option-existing" className="font-normal cursor-pointer">
                  Move to an existing sprint
                </Label>
              </div>

              {selectedOption === "existing" && (
                <div className="ml-6">
                  {availableSprints.length > 0 ? (
                    <Select value={selectedSprintId} onValueChange={setSelectedSprintId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a sprint" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSprints.map((s) => (
                          <SelectItem key={s._id.toString()} value={s._id.toString()}>
                            <div className="flex items-center gap-2">
                              <span>{s.name}</span>
                              <Badge
                                variant={s.status === "active" ? "default" : "outline"}
                                className="text-xs"
                              >
                                {s.status}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No available sprints. Create a new one or move to backlog.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Option 2: Create new sprint */}
            {onCreateNewSprint && (
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id="option-new"
                  value="new"
                  checked={selectedOption === "new"}
                  onChange={() => setSelectedOption("new")}
                  className="h-4 w-4"
                />
                <Label htmlFor="option-new" className="font-normal cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Create a new sprint for these tasks
                  </div>
                </Label>
              </div>
            )}

            {/* Option 3: Move to backlog */}
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="option-backlog"
                value="backlog"
                checked={selectedOption === "backlog"}
                onChange={() => setSelectedOption("backlog")}
                className="h-4 w-4"
              />
              <Label htmlFor="option-backlog" className="font-normal cursor-pointer">
                Move to backlog (unassigned)
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={isProcessing}>
            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Sprint
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

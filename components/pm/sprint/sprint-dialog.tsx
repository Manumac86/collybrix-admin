"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { Sprint, SprintFormData } from "@/types/pm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const sprintSchema = z.object({
  name: z.string().min(1, "Sprint name is required").max(100),
  goal: z.string().min(1, "Sprint goal is required").max(500),
  startDate: z.date({
    required_error: "Start date is required",
  }),
  endDate: z.date({
    required_error: "End date is required",
  }),
  capacity: z.number().min(1, "Capacity must be at least 1").max(1000),
  status: z.enum(["planning", "active", "completed", "archived"]).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type SprintFormValues = z.infer<typeof sprintSchema>;

interface SprintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sprint?: Sprint;
  projectId: string;
  onSubmit: (data: Partial<SprintFormData>) => Promise<void>;
  isLoading?: boolean;
}

/**
 * SprintDialog Component
 *
 * Form for creating/editing sprints
 * Fields: name, goal (textarea), start date, end date, capacity (number), status (for edit only)
 * Validation: end date must be after start date, can't start in the past
 *
 * @example
 * <SprintDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   projectId={projectId}
 *   onSubmit={handleCreateSprint}
 *   isLoading={isCreating}
 * />
 */
export function SprintDialog({
  open,
  onOpenChange,
  sprint,
  projectId,
  onSubmit,
  isLoading = false,
}: SprintDialogProps) {
  const isEditMode = !!sprint;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<SprintFormValues>({
    resolver: zodResolver(sprintSchema),
    defaultValues: {
      name: sprint?.name || "",
      goal: sprint?.goal || "",
      startDate: sprint?.startDate ? new Date(sprint.startDate) : undefined,
      endDate: sprint?.endDate ? new Date(sprint.endDate) : undefined,
      capacity: sprint?.capacity || 40,
      status: sprint?.status || "planning",
    },
  });

  const startDate = watch("startDate");
  const endDate = watch("endDate");
  const status = watch("status");

  useEffect(() => {
    if (open && sprint) {
      reset({
        name: sprint.name,
        goal: sprint.goal,
        startDate: new Date(sprint.startDate),
        endDate: new Date(sprint.endDate),
        capacity: sprint.capacity,
        status: sprint.status,
      });
    } else if (open && !sprint) {
      reset({
        name: "",
        goal: "",
        startDate: undefined,
        endDate: undefined,
        capacity: 40,
        status: "planning",
      });
    }
  }, [open, sprint, reset]);

  const handleFormSubmit = async (data: SprintFormValues) => {
    const formData: Partial<SprintFormData> = {
      projectId,
      name: data.name,
      goal: data.goal,
      startDate: data.startDate,
      endDate: data.endDate,
      capacity: data.capacity,
      status: data.status || "planning",
    };

    await onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Sprint" : "Create New Sprint"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update sprint details and settings."
              : "Set up a new sprint with goals, timeline, and capacity."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {/* Sprint Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Sprint Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Sprint 24"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Sprint Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">Sprint Goal *</Label>
            <Textarea
              id="goal"
              placeholder="What do you want to achieve in this sprint?"
              rows={3}
              {...register("goal")}
            />
            {errors.goal && (
              <p className="text-sm text-red-600">{errors.goal.message}</p>
            )}
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => setValue("startDate", date as Date)}
                    disabled={(date) =>
                      !isEditMode && date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => setValue("endDate", date as Date)}
                    disabled={(date) =>
                      startDate ? date <= startDate : date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate.message}</p>
              )}
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (Story Points) *</Label>
            <Input
              id="capacity"
              type="number"
              min={1}
              max={1000}
              placeholder="40"
              {...register("capacity", { valueAsNumber: true })}
            />
            {errors.capacity && (
              <p className="text-sm text-red-600">{errors.capacity.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Total story points the team can commit to in this sprint
            </p>
          </div>

          {/* Status (Edit Mode Only) */}
          {isEditMode && (
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) =>
                  setValue("status", value as SprintFormValues["status"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Update Sprint" : "Create Sprint"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

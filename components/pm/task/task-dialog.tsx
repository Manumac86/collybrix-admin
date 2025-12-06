"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import type { MultiSelectOption } from "@/components/ui/multi-select";
import { taskCreateSchema } from "@/lib/validation/pm-schemas";
import {
  TASK_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  STORY_POINTS,
} from "@/types/pm";
import type { Task, User, Tag } from "@/types/pm";
import { Loader2, Plus, X, UserCircle, Tag as TagIcon } from "lucide-react";

// Generate a UUID v4
const generateId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: any) => Promise<void>;
  task?: Task;
  projectId: string;
  currentUserId: string;
  users?: User[];
  tags?: Tag[]; // Available tags for the project
  availableTasks?: Task[]; // For parent task selection
  mode?: "create" | "edit";
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().optional(),
  type: z.enum(TASK_TYPES),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  storyPoints: z.string().optional(),
  assigneeIds: z.array(z.string()).default([]), // Changed to array for multiple assignees
  tags: z.array(z.string()).default([]), // Tags as array of ObjectIds
  parentId: z.string().optional(),
  dueDate: z.string().optional(),
  acceptanceCriteria: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean(),
    })
  ),
});

type FormData = z.infer<typeof formSchema>;

export function TaskDialog({
  open,
  onOpenChange,
  onSubmit,
  task,
  projectId,
  currentUserId,
  users = [],
  tags = [],
  availableTasks = [],
  mode = "create",
}: TaskDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(
    task?.acceptanceCriteria || []
  );
  const [newCriterion, setNewCriterion] = useState("");

  // Filter available parent tasks (only epic and story types)
  const parentTasks = availableTasks.filter(
    (t) =>
      (t.type === "epic" || t.type === "story") &&
      t._id.toString() !== task?._id.toString()
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description,
          type: task.type,
          priority: task.priority,
          status: task.status,
          storyPoints: task.storyPoints?.toString() ?? "none",
          assigneeIds: task.assigneeIds || (task.assigneeId ? [task.assigneeId] : []), // Support both old and new
          tags: task.tags?.map((t) => t.toString()) || [],
          parentId: task.parentId?.toString() ?? "none",
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "",
          acceptanceCriteria: task.acceptanceCriteria,
        }
      : {
          title: "",
          description: "",
          type: "task",
          priority: "medium",
          status: "backlog",
          storyPoints: "none",
          assigneeIds: [],
          tags: [],
          parentId: "none",
          dueDate: "",
          acceptanceCriteria: [],
        },
  });

  const handleFormSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const parentId =
        data.parentId === "none" || !data.parentId ? null : data.parentId;

      const payload = {
        projectId,
        reporterId: currentUserId,
        title: data.title,
        description: data.description ?? "",
        type: data.type,
        priority: data.priority,
        status: data.status,
        storyPoints:
          data.storyPoints &&
          data.storyPoints !== "none" &&
          data.storyPoints !== ""
            ? data.storyPoints
            : null,
        assigneeIds: data.assigneeIds || [], // Array of assignee IDs
        tags: data.tags || [], // Array of tag IDs
        parentId,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        acceptanceCriteria,
        attachments: task?.attachments ?? [],
        dependencies: task?.dependencies ?? [],
        sprintId: task?.sprintId ?? null,
        estimatedHours: task?.estimatedHours ?? null,
        actualHours: task?.actualHours ?? null,
      };

      await onSubmit(payload);
      reset();
      setAcceptanceCriteria([]);
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCriterion = () => {
    if (newCriterion.trim()) {
      setAcceptanceCriteria([
        ...acceptanceCriteria,
        {
          id: generateId(),
          text: newCriterion.trim(),
          completed: false,
        },
      ]);
      setNewCriterion("");
    }
  };

  const removeCriterion = (id: string) => {
    setAcceptanceCriteria(acceptanceCriteria.filter((c) => c.id !== id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create New Task" : "Edit Task"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new task to the backlog. Fill in the details below."
              : "Update the task details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="title">
                Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Brief description of the task"
                aria-invalid={!!errors.title}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Detailed description (supports Markdown)"
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Supports Markdown formatting
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={watch("type")}
                  onValueChange={(value: any) => setValue("type", value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value: any) => setValue("priority", value)}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value: any) => setValue("status", value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUSES.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="storyPoints">Story Points</Label>
                <Select
                  value={watch("storyPoints") || "none"}
                  onValueChange={(value) =>
                    setValue("storyPoints", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger id="storyPoints">
                    <SelectValue placeholder="Select points" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No points</SelectItem>
                    {STORY_POINTS.map((points) => (
                      <SelectItem key={points} value={points.toString()}>
                        {points} {points === 1 ? "point" : "points"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="assigneeIds">Assignees</Label>
              <MultiSelect
                options={users.map((user) => ({
                  label: user.name,
                  value: user._id.toString(),
                  icon: UserCircle,
                }))}
                selected={watch("assigneeIds") || []}
                onChange={(values) => setValue("assigneeIds", values)}
                placeholder="Select assignees..."
                searchPlaceholder="Search users..."
                emptyText="No users found."
              />
              <p className="text-xs text-muted-foreground mt-1">
                You can assign multiple team members to this task
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="tags">Tags</Label>
              <MultiSelect
                options={tags.map((tag) => ({
                  label: tag.name,
                  value: tag._id.toString(),
                  icon: TagIcon,
                }))}
                selected={watch("tags") || []}
                onChange={(values) => setValue("tags", values)}
                placeholder="Select tags..."
                searchPlaceholder="Search tags..."
                emptyText="No tags found."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tags help categorize and filter tasks
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" {...register("dueDate")} />
            </div>

            {/* Parent Task Selection */}
            <div className="flex flex-col gap-1">
              <Label htmlFor="parentId">Parent Task (Epic or Story)</Label>
              <Select
                value={watch("parentId") || "none"}
                onValueChange={(value) =>
                  setValue("parentId", value === "none" ? "" : value)
                }
              >
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="No parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No parent</SelectItem>
                  {parentTasks.map((parentTask) => (
                    <SelectItem
                      key={parentTask._id.toString()}
                      value={parentTask._id.toString()}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          [{parentTask.type === "epic" ? "Epic" : "Story"}]
                        </span>
                        <span>{parentTask.title}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Assign this task as a child of an Epic or Story
              </p>
            </div>

            <div className="flex flex-col gap-1">
              <Label>Acceptance Criteria</Label>
              <div className="space-y-2 mt-2">
                {acceptanceCriteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <span className="flex-1 text-sm">{criterion.text}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCriterion(criterion.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add acceptance criterion..."
                    value={newCriterion}
                    onChange={(e) => setNewCriterion(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCriterion();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCriterion}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "create" ? "Create Task" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

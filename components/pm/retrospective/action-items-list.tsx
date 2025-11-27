"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/pm/shared/user-avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, CheckCircle2, Circle, Clock, Trash2, StickyNote, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/pm-utils";
import type {
  RetrospectiveActionItem,
  RetrospectiveActionStatus,
  RetrospectiveCard,
} from "@/types/pm";

interface ActionItemsListProps {
  actions: RetrospectiveActionItem[];
  cards: RetrospectiveCard[];
  users: Array<{
    _id: string;
    name: string;
    avatarUrl: string | null;
    role: string;
  }>;
  onCreateAction: (data: {
    title: string;
    description?: string;
    assigneeId?: string | null;
    dueDate?: Date | null;
    cardIds?: string[];
  }) => Promise<void>;
  onUpdateAction: (
    actionId: string,
    data: {
      title?: string;
      description?: string;
      assigneeId?: string | null;
      status?: RetrospectiveActionStatus;
      dueDate?: Date | null;
    }
  ) => Promise<void>;
  onDeleteAction: (actionId: string) => Promise<void>;
  isLoading?: boolean;
}

const STATUS_CONFIG = {
  todo: {
    label: "To Do",
    icon: Circle,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
  },
  in_progress: {
    label: "In Progress",
    icon: Clock,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  done: {
    label: "Done",
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-100",
  },
};

export function ActionItemsList({
  actions,
  cards,
  users,
  onCreateAction,
  onUpdateAction,
  onDeleteAction,
  isLoading = false,
}: ActionItemsListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string | null>(null);
  const [dueDate, setDueDate] = useState<string>("");
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreateAction({
        title: title.trim(),
        description: description.trim() || undefined,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        cardIds: selectedCardIds,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setAssigneeId(null);
      setDueDate("");
      setSelectedCardIds([]);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Failed to create action:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCardSelection = (cardId: string) => {
    setSelectedCardIds((prev) =>
      prev.includes(cardId)
        ? prev.filter((id) => id !== cardId)
        : [...prev, cardId]
    );
  };

  const handleStatusChange = async (
    actionId: string,
    newStatus: RetrospectiveActionStatus
  ) => {
    await onUpdateAction(actionId, { status: newStatus });
  };

  const handleDelete = async (actionId: string) => {
    if (!window.confirm("Delete this action item?")) return;
    await onDeleteAction(actionId);
  };

  // Group actions by status
  const actionsByStatus = {
    todo: actions.filter((a) => a.status === "todo"),
    in_progress: actions.filter((a) => a.status === "in_progress"),
    done: actions.filter((a) => a.status === "done"),
  };

  const completionRate =
    actions.length > 0
      ? Math.round((actionsByStatus.done.length / actions.length) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Action Items</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {actions.length} total • {actionsByStatus.done.length} completed
                • {completionRate}% done
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Actions List */}
      <div className="space-y-4">
        {actions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm text-muted-foreground">
                No action items yet. Create one to track follow-ups!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {actions.map((action) => {
              const assignee = users.find((u) => u._id === action.assigneeId);
              const statusConfig = STATUS_CONFIG[action.status];
              const StatusIcon = statusConfig.icon;
              const isOverdue =
                action.dueDate &&
                new Date(action.dueDate) < new Date() &&
                action.status !== "done";

              return (
                <Card
                  key={action._id.toString()}
                  className={cn(
                    "transition-all hover:shadow-md",
                    action.status === "done" && "opacity-60"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      {/* Left Side - Status & Content */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Status Dropdown */}
                        <Select
                          value={action.status}
                          onValueChange={(value) =>
                            handleStatusChange(
                              action._id.toString(),
                              value as RetrospectiveActionStatus
                            )
                          }
                        >
                          <SelectTrigger className="w-[140px] h-8">
                            <div className="flex items-center gap-2">
                              <SelectValue />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_CONFIG).map(
                              ([status, config]) => {
                                const Icon = config.icon;
                                return (
                                  <SelectItem key={status} value={status}>
                                    <div className="flex items-center gap-2">
                                      <Icon
                                        className={cn("h-4 w-4", config.color)}
                                      />
                                      {config.label}
                                    </div>
                                  </SelectItem>
                                );
                              }
                            )}
                          </SelectContent>
                        </Select>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4
                            className={cn(
                              "font-medium text-sm mb-1",
                              action.status === "done" && "line-through"
                            )}
                          >
                            {action.title}
                          </h4>
                          {action.description && (
                            <p className="text-sm text-muted-foreground mb-2">
                              {action.description}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            {assignee && (
                              <div className="flex items-center gap-1">
                                <UserAvatar
                                  user={assignee as any}
                                  size="sm"
                                  showTooltip={false}
                                />
                                <span>{assignee.name}</span>
                              </div>
                            )}
                            {action.dueDate && (
                              <Badge
                                variant={isOverdue ? "destructive" : "outline"}
                                className="h-5"
                              >
                                {isOverdue && "Overdue: "}
                                {formatDate(action.dueDate)}
                              </Badge>
                            )}
                          </div>

                          {/* Linked Cards */}
                          {action.cardIds && action.cardIds.length > 0 && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center gap-2 mb-2">
                                <Link2 className="h-3 w-3 text-muted-foreground" />
                                <span className="text-xs font-medium text-muted-foreground">
                                  Related feedback ({action.cardIds.length})
                                </span>
                              </div>
                              <div className="space-y-1">
                                {action.cardIds.map((cardId) => {
                                  const card = cards.find(
                                    (c) => c._id.toString() === cardId.toString()
                                  );
                                  if (!card) return null;
                                  return (
                                    <div
                                      key={card._id.toString()}
                                      className="flex items-start gap-2 p-2 rounded bg-muted/50 text-xs"
                                    >
                                      <StickyNote className="h-3 w-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                                      <span className="flex-1 line-clamp-2">
                                        {card.content}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Side - Delete */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(action._id.toString())}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Action Item</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                maxLength={200}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Description
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Additional details..."
                className="min-h-[80px]"
                maxLength={1000}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Assignee</label>
              <Select
                value={assigneeId || "unassigned"}
                onValueChange={setAssigneeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Due Date</label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Card Selection */}
            {cards.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Link to Cards (Optional)
                </label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select retrospective cards that led to this action item
                </p>
                <div className="max-h-[200px] overflow-y-auto space-y-2 border rounded-md p-3">
                  {cards.map((card) => {
                    const isSelected = selectedCardIds.includes(
                      card._id.toString()
                    );
                    return (
                      <div
                        key={card._id.toString()}
                        className={cn(
                          "flex items-start gap-2 p-2 rounded cursor-pointer transition-colors",
                          isSelected
                            ? "bg-primary/10 border border-primary"
                            : "bg-muted/50 hover:bg-muted"
                        )}
                        onClick={() => toggleCardSelection(card._id.toString())}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() =>
                            toggleCardSelection(card._id.toString())
                          }
                          className="mt-0.5"
                        />
                        <div className="flex-1 text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-[10px] h-4">
                              {card.column}
                            </Badge>
                            <span className="text-muted-foreground">
                              {card.votes.length} votes
                            </span>
                          </div>
                          <p className="line-clamp-2">{card.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {selectedCardIds.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {selectedCardIds.length} card(s) selected
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!title.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating..." : "Create Action"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

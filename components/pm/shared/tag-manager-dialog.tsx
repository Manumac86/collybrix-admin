"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Tag as TagIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useTags, useCreateTag, useUpdateTag, useDeleteTag, useTasks } from "@/hooks/pm";
import { toast } from "sonner";
import { ColorPicker, TAG_COLORS } from "./color-picker";
import type { Tag } from "@/types/pm";
import { cn } from "@/lib/utils";

interface TagManagerDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TagManagerDialog({
  projectId,
  open,
  onOpenChange,
}: TagManagerDialogProps) {
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[5].hex);
  const [editTagName, setEditTagName] = useState("");
  const [editTagColor, setEditTagColor] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "usage" | "recent">("name");

  const { tags, isLoading } = useTags(projectId);
  const { tasks } = useTasks(projectId);
  const { trigger: createTag, isMutating: isCreating } = useCreateTag();
  const { trigger: updateTag, isMutating: isUpdating } = useUpdateTag(
    editingTag?._id.toString() || null
  );
  const { trigger: deleteTag, isMutating: isDeleting } = useDeleteTag(
    deletingTag?._id.toString() || null
  );

  // Calculate usage count for each tag
  const tagUsage = tags.map((tag) => {
    const count = tasks.filter((task) =>
      task.tags.some((t) => t.toString() === tag._id.toString())
    ).length;
    return { ...tag, usageCount: count };
  });

  // Sort tags
  const sortedTags = [...tagUsage].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "usage":
        return b.usageCount - a.usageCount;
      case "recent":
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      default:
        return 0;
    }
  });

  const handleCreateTag = async () => {
    if (!newTagName.trim()) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const result = await createTag({
        projectId,
        name: newTagName.trim(),
        color: newTagColor,
      });

      if (result.success) {
        toast.success("Tag created successfully");
        setShowCreateDialog(false);
        setNewTagName("");
        setNewTagColor(TAG_COLORS[5].hex);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create tag");
    }
  };

  const handleEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
  };

  const handleUpdateTag = async () => {
    if (!editTagName.trim() || !editingTag) {
      toast.error("Tag name is required");
      return;
    }

    try {
      const result = await updateTag({
        projectId,
        name: editTagName.trim(),
        color: editTagColor,
      });

      if (result.success) {
        toast.success("Tag updated successfully");
        setEditingTag(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update tag");
    }
  };

  const handleDeleteTag = async () => {
    if (!deletingTag) return;

    try {
      const result = await deleteTag();

      if (result.success) {
        toast.success("Tag deleted successfully");
        setDeletingTag(null);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete tag");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Manage Tags</DialogTitle>
            <DialogDescription>
              Create, edit, and delete tags for your project. Tags help
              categorize and organize tasks.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Actions and Sort */}
            <div className="flex items-center justify-between gap-4">
              <Button
                type="button"
                onClick={() => setShowCreateDialog(true)}
                size="sm"
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                New Tag
              </Button>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "name" | "usage" | "recent")
                  }
                  className="text-sm border rounded px-2 py-1"
                >
                  <option value="name">Name</option>
                  <option value="usage">Usage</option>
                  <option value="recent">Recently Created</option>
                </select>
              </div>
            </div>

            {/* Tag List */}
            <div className="border rounded-lg overflow-auto max-h-96">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading tags...
                </div>
              ) : sortedTags.length === 0 ? (
                <div className="p-8 text-center">
                  <TagIcon className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">No tags yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first tag to get started
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {sortedTags.map((tag) => (
                    <div
                      key={tag._id.toString()}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div
                        className="h-4 w-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tag.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{tag.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {tag.usageCount} {tag.usageCount === 1 ? "task" : "tasks"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditTag(tag)}
                          aria-label={`Edit ${tag.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingTag(tag)}
                          aria-label={`Delete ${tag.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Tag Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Add a new tag to categorize tasks in your project.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="create-tag-name">Tag Name</Label>
              <Input
                id="create-tag-name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="e.g., Feature, Bug, Enhancement"
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Tag Color</Label>
              <ColorPicker value={newTagColor} onChange={setNewTagColor} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCreateTag}
              disabled={isCreating || !newTagName.trim()}
            >
              {isCreating ? "Creating..." : "Create Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Tag Dialog */}
      <Dialog
        open={!!editingTag}
        onOpenChange={(open) => !open && setEditingTag(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag name or color.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-tag-name">Tag Name</Label>
              <Input
                id="edit-tag-name"
                value={editTagName}
                onChange={(e) => setEditTagName(e.target.value)}
                placeholder="e.g., Feature, Bug, Enhancement"
              />
            </div>

            <div className="space-y-2">
              <Label>Tag Color</Label>
              <ColorPicker value={editTagColor} onChange={setEditTagColor} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingTag(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdateTag}
              disabled={isUpdating || !editTagName.trim()}
            >
              {isUpdating ? "Updating..." : "Update Tag"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deletingTag}
        onOpenChange={(open) => !open && setDeletingTag(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingTag?.name}"? This will
              remove the tag from all tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteTag}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

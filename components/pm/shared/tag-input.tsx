"use client";

import { useState } from "react";
import { X, Tag as TagIcon, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { useTags, useCreateTag } from "@/hooks/pm";
import { toast } from "sonner";
import type { Tag } from "@/types/pm";
import { ObjectId } from "mongodb";
import { ColorPicker, TAG_COLORS } from "./color-picker";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TagInputProps {
  projectId: string;
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
  className?: string;
}

export function TagInput({
  projectId,
  selectedTagIds,
  onChange,
  className,
}: TagInputProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[5].hex); // Blue default

  const { tags, isLoading } = useTags(projectId);
  const { trigger: createTag, isMutating: isCreating } = useCreateTag();

  // Get selected tag objects
  const selectedTags = tags.filter((tag) =>
    selectedTagIds.includes(tag._id.toString())
  );

  // Filter tags by search
  const filteredTags = tags.filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTag = (tag: Tag) => {
    const tagId = tag._id.toString();
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter((id) => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  const handleRemoveTag = (tagId: string) => {
    onChange(selectedTagIds.filter((id) => id !== tagId));
  };

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

      if (result.success && result.data) {
        toast.success("Tag created successfully");
        // Auto-select the new tag
        onChange([...selectedTagIds, result.data._id.toString()]);
        setShowCreateDialog(false);
        setNewTagName("");
        setNewTagColor(TAG_COLORS[5].hex);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to create tag");
    }
  };

  const openCreateDialog = () => {
    setNewTagName(search);
    setShowCreateDialog(true);
    setOpen(false);
  };

  return (
    <>
      <div className={cn("space-y-2", className)}>
        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag._id.toString()}
                variant="secondary"
                className="gap-1 pr-1"
                style={{
                  borderLeft: `3px solid ${tag.color}`,
                }}
              >
                <span>{tag.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag._id.toString())}
                  className="rounded-full p-0.5 hover:bg-muted-foreground/20 transition-colors"
                  aria-label={`Remove ${tag.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Tag selector */}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              aria-label="Add tags"
            >
              <Plus className="h-4 w-4" />
              Add Tags
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search or create tag..."
                value={search}
                onValueChange={setSearch}
              />
              <CommandList>
                {isLoading ? (
                  <CommandEmpty>Loading tags...</CommandEmpty>
                ) : filteredTags.length === 0 ? (
                  <CommandEmpty>
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        No tags found
                      </p>
                      {search && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={openCreateDialog}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Create "{search}"
                        </Button>
                      )}
                    </div>
                  </CommandEmpty>
                ) : (
                  <>
                    <CommandGroup>
                      {filteredTags.map((tag) => {
                        const isSelected = selectedTagIds.includes(
                          tag._id.toString()
                        );
                        return (
                          <CommandItem
                            key={tag._id.toString()}
                            onSelect={() => handleSelectTag(tag)}
                            className="gap-2"
                          >
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="flex-1">{tag.name}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                    {search && !filteredTags.some((t) => t.name.toLowerCase() === search.toLowerCase()) && (
                      <CommandGroup>
                        <CommandItem onSelect={openCreateDialog} className="gap-2">
                          <Plus className="h-4 w-4" />
                          Create "{search}"
                        </CommandItem>
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

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
              <Label htmlFor="tag-name">Tag Name</Label>
              <Input
                id="tag-name"
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
    </>
  );
}

"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Tag } from "@/types/pm";

interface TagBadgeProps {
  tag: Tag;
  onClick?: () => void;
  className?: string;
}

/**
 * TagBadge - Display a tag with its color
 * Click handler is optional for filtering tasks by tag
 */
export function TagBadge({ tag, onClick, className }: TagBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1.5 cursor-pointer hover:opacity-80 transition-opacity",
        !onClick && "cursor-default",
        className
      )}
      style={{
        borderLeft: `3px solid ${tag.color}`,
      }}
      onClick={onClick}
    >
      <div
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: tag.color }}
      />
      <span>{tag.name}</span>
    </Badge>
  );
}

/**
 * TagList - Display multiple tags
 */
export function TagList({
  tags,
  onTagClick,
  className,
}: {
  tags: Tag[];
  onTagClick?: (tag: Tag) => void;
  className?: string;
}) {
  if (tags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <TagBadge
          key={tag._id.toString()}
          tag={tag}
          onClick={onTagClick ? () => onTagClick(tag) : undefined}
        />
      ))}
    </div>
  );
}

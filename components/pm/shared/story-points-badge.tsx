import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { StoryPoint } from "@/types/pm";

interface StoryPointsBadgeProps {
  points: StoryPoint | null;
  className?: string;
}

export function StoryPointsBadge({ points, className }: StoryPointsBadgeProps) {
  if (points === null) {
    return (
      <Badge variant="outline" className={cn("font-normal text-xs", className)}>
        No points
      </Badge>
    );
  }

  return (
    <Badge
      variant="secondary"
      className={cn("font-semibold text-xs", className)}
    >
      {points} {points === 1 ? "pt" : "pts"}
    </Badge>
  );
}

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getPriorityColor, getPriorityLabel } from "@/lib/pm-utils";
import type { TaskPriority } from "@/types/pm";

interface PriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <Badge
      className={cn(
        "font-medium text-xs",
        getPriorityColor(priority),
        className
      )}
    >
      {getPriorityLabel(priority)}
    </Badge>
  );
}

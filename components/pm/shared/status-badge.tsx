import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getStatusColor, getStatusLabel } from "@/lib/pm-utils";
import type { TaskStatus } from "@/types/pm";

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      className={cn(
        "font-medium text-xs",
        getStatusColor(status),
        className
      )}
    >
      {getStatusLabel(status)}
    </Badge>
  );
}

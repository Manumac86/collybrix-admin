"use client";

import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import type { User, UserRole } from "@/types/pm";
import { Loader2 } from "lucide-react";

interface UserAvatarProps {
  user: User | null;
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
  showRoleBadge?: boolean;
  isLoading?: boolean;
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Admin",
  project_manager: "PM",
  developer: "Dev",
  designer: "Design",
  qa: "QA",
};

export function UserAvatar({
  user,
  size = "sm",
  className,
  showTooltip = true,
  showRoleBadge = false,
  isLoading = false,
}: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getColorClass = (name: string) => {
    const colorClasses = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-amber-500",
      "bg-pink-500",
      "bg-indigo-500",
    ];
    const colorIndex = name.charCodeAt(0) % colorClasses.length;
    return colorClasses[colorIndex];
  };

  if (isLoading) {
    return (
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarFallback>
          <Loader2 className="h-3 w-3 animate-spin" />
        </AvatarFallback>
      </Avatar>
    );
  }

  const avatarContent = (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        {user?.avatarUrl && (
          <AvatarImage src={user.avatarUrl} alt={user.name} />
        )}
        <AvatarFallback
          className={cn(
            "font-medium",
            user
              ? `${getColorClass(user.name)} text-white`
              : "bg-muted text-muted-foreground"
          )}
        >
          {user ? getInitials(user.name) : "?"}
        </AvatarFallback>
      </Avatar>
      {showRoleBadge && user && (
        <Badge
          variant="secondary"
          className="absolute -bottom-1 -right-1 text-[8px] px-1 py-0 h-4 border-2 border-background"
        >
          {ROLE_LABELS[user.role]}
        </Badge>
      )}
    </div>
  );

  if (showTooltip && user) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{avatarContent}</TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p className="font-medium">{user.name}</p>
              <p className="text-muted-foreground text-xs">
                {ROLE_LABELS[user.role]}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return avatarContent;
}

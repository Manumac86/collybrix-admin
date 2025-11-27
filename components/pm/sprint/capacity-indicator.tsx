"use client";

import { AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CapacityIndicatorProps {
  usedPoints: number;
  totalCapacity: number;
  className?: string;
}

/**
 * CapacityIndicator Component
 *
 * Visual progress bar showing story points used vs capacity
 * Color coding: Green (<80%), Yellow (80-100%), Red (>100%)
 *
 * @example
 * <CapacityIndicator usedPoints={42} totalCapacity={50} />
 */
export function CapacityIndicator({
  usedPoints,
  totalCapacity,
  className = "",
}: CapacityIndicatorProps) {
  const percentage = totalCapacity > 0 ? (usedPoints / totalCapacity) * 100 : 0;
  const isOverCapacity = percentage > 100;
  const isNearCapacity = percentage >= 80 && percentage <= 100;

  // Determine color based on capacity
  const getColorClass = () => {
    if (isOverCapacity) return "bg-red-500";
    if (isNearCapacity) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getTextColorClass = () => {
    if (isOverCapacity) return "text-red-600";
    if (isNearCapacity) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="font-medium">Capacity</span>
          {isOverCapacity && (
            <div className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-xs font-medium">Over Capacity</span>
            </div>
          )}
        </div>
        <span className={`font-semibold ${getTextColorClass()}`}>
          {usedPoints} / {totalCapacity} points ({Math.round(percentage)}%)
        </span>
      </div>

      <div className="relative">
        <Progress
          value={Math.min(percentage, 100)}
          className="h-3"
          indicatorClassName={getColorClass()}
        />
        {isOverCapacity && (
          <div className="absolute top-0 left-0 h-3 w-full bg-red-100 opacity-30 rounded-full" />
        )}
      </div>

      {isOverCapacity && (
        <p className="text-xs text-red-600">
          Sprint is over capacity by {usedPoints - totalCapacity} points. Consider removing some tasks or increasing capacity.
        </p>
      )}
      {isNearCapacity && !isOverCapacity && (
        <p className="text-xs text-yellow-600">
          Sprint is near capacity. Monitor task additions carefully.
        </p>
      )}
    </div>
  );
}

"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  SortAsc,
  List,
  LayoutGrid,
  Trash2,
} from "lucide-react";
import { TASK_STATUSES, TASK_TYPES, TASK_PRIORITIES } from "@/types/pm";
import type { TaskStatus, TaskType, TaskPriority } from "@/types/pm";

interface BacklogToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: TaskStatus | "all";
  onStatusFilterChange: (value: TaskStatus | "all") => void;
  typeFilter: TaskType | "all";
  onTypeFilterChange: (value: TaskType | "all") => void;
  priorityFilter: TaskPriority | "all";
  onPriorityFilterChange: (value: TaskPriority | "all") => void;
  assigneeFilter: string | "all";
  onAssigneeFilterChange: (value: string | "all") => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  viewMode: "list" | "card";
  onViewModeChange: (value: "list" | "card") => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
}

export function BacklogToolbar({
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  viewMode,
  onViewModeChange,
  selectedCount = 0,
  onBulkDelete,
}: BacklogToolbarProps) {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks by title or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("list")}
            title="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "default" : "outline"}
            size="icon"
            onClick={() => onViewModeChange("card")}
            title="Card view"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {TASK_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {TASK_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={onPriorityFilterChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {TASK_PRIORITIES.map((priority) => (
              <SelectItem key={priority} value={priority}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SortAsc className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
            <SelectItem value="priority-desc">Priority (High to Low)</SelectItem>
            <SelectItem value="priority-asc">Priority (Low to High)</SelectItem>
            <SelectItem value="storyPoints-desc">Story Points (High to Low)</SelectItem>
            <SelectItem value="storyPoints-asc">Story Points (Low to High)</SelectItem>
            <SelectItem value="title-asc">Title (A-Z)</SelectItem>
          </SelectContent>
        </Select>

        {selectedCount > 0 && (
          <Button
            variant="destructive"
            onClick={onBulkDelete}
            className="w-full sm:w-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {selectedCount}
          </Button>
        )}
      </div>
    </div>
  );
}

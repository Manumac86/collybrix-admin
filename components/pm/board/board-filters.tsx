"use client";

import { useMemo, useState, useEffect } from "react";
import { X, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskType, TaskPriority, User, Sprint } from "@/types/pm";

export interface BoardFiltersState {
  search: string;
  myTasks: boolean;
  assigneeId: string | null;
  type: TaskType | null;
  priority: TaskPriority | null;
  sprintId: string | null;
}

interface BoardFiltersProps {
  filters: BoardFiltersState;
  onFiltersChange: (filters: BoardFiltersState) => void;
  users: User[];
  sprints: Sprint[];
  currentUserId?: string;
}

const TYPE_OPTIONS: { value: TaskType; label: string }[] = [
  { value: "story", label: "Story" },
  { value: "task", label: "Task" },
  { value: "bug", label: "Bug" },
  { value: "epic", label: "Epic" },
  { value: "spike", label: "Spike" },
];

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function BoardFilters({
  filters,
  onFiltersChange,
  users,
  sprints,
  currentUserId,
}: BoardFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.search) {
        onFiltersChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.myTasks) count++;
    if (filters.assigneeId) count++;
    if (filters.type) count++;
    if (filters.priority) count++;
    if (filters.sprintId) count++;
    if (filters.search) count++;
    return count;
  }, [filters]);

  const handleClearAll = () => {
    setSearchInput("");
    onFiltersChange({
      search: "",
      myTasks: false,
      assigneeId: null,
      type: null,
      priority: null,
      sprintId: null,
    });
  };

  const removeFilter = (key: keyof BoardFiltersState) => {
    if (key === "search") {
      setSearchInput("");
    }
    onFiltersChange({
      ...filters,
      [key]: key === "myTasks" ? false : key === "search" ? "" : null,
    });
  };

  return (
    <div className="space-y-3 rounded-lg border bg-card p-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* My Tasks Toggle */}
        {currentUserId && (
          <Button
            variant={filters.myTasks ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onFiltersChange({ ...filters, myTasks: !filters.myTasks })
            }
          >
            My Tasks
          </Button>
        )}

        {/* Sprint Filter */}
        <Select
          value={filters.sprintId || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              sprintId: value === "all" ? null : value,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All sprints" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All sprints</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {sprints.map((sprint) => (
              <SelectItem key={sprint._id.toString()} value={sprint._id.toString()}>
                {sprint.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Type Filter */}
        <Select
          value={filters.type || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              type: value === "all" ? null : (value as TaskType),
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              priority: value === "all" ? null : (value as TaskPriority),
            })
          }
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {PRIORITY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Assignee Filter */}
        <Select
          value={filters.assigneeId || "all"}
          onValueChange={(value) =>
            onFiltersChange({
              ...filters,
              assigneeId: value === "all" ? null : value,
            })
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {users.map((user) => (
              <SelectItem key={user._id.toString()} value={user._id.toString()}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear All */}
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={handleClearAll}>
            Clear all
          </Button>
        )}

        {/* Filter Count Indicator */}
        {activeFilterCount > 0 && (
          <Badge variant="secondary" className="ml-auto">
            <Filter className="mr-1 h-3 w-3" />
            {activeFilterCount} active
          </Badge>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="gap-1">
              Search: {filters.search}
              <button
                onClick={() => removeFilter("search")}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.myTasks && (
            <Badge variant="outline" className="gap-1">
              My Tasks
              <button
                onClick={() => removeFilter("myTasks")}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.sprintId && (
            <Badge variant="outline" className="gap-1">
              Sprint: {sprints.find((s) => s._id.toString() === filters.sprintId)?.name || "Unassigned"}
              <button
                onClick={() => removeFilter("sprintId")}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.type && (
            <Badge variant="outline" className="gap-1">
              Type: {TYPE_OPTIONS.find((t) => t.value === filters.type)?.label}
              <button
                onClick={() => removeFilter("type")}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.priority && (
            <Badge variant="outline" className="gap-1">
              Priority: {PRIORITY_OPTIONS.find((p) => p.value === filters.priority)?.label}
              <button
                onClick={() => removeFilter("priority")}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {filters.assigneeId && (
            <Badge variant="outline" className="gap-1">
              Assignee: {users.find((u) => u._id.toString() === filters.assigneeId)?.name || "Unassigned"}
              <button
                onClick={() => removeFilter("assigneeId")}
                className="ml-1 rounded-full hover:bg-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

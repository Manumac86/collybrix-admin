"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { TaskType, TaskPriority } from "@/types/pm";

interface SprintPlanningState {
  selectedTasks: string[];
  searchQuery: string;
  filterType: TaskType | "all";
  filterPriority: TaskPriority | "all";
  viewMode: "list" | "compact";
}

interface SprintPlanningContextValue extends SprintPlanningState {
  setSelectedTasks: (tasks: string[]) => void;
  toggleTaskSelection: (taskId: string) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: TaskType | "all") => void;
  setFilterPriority: (priority: TaskPriority | "all") => void;
  setViewMode: (mode: "list" | "compact") => void;
  resetFilters: () => void;
}

const SprintPlanningContext = createContext<SprintPlanningContextValue | undefined>(
  undefined
);

/**
 * SprintPlanningProvider Component
 *
 * React Context for sprint planning UI state
 * State: selected tasks, filter preferences, view modes
 * Actions: select tasks, toggle filters, update view
 *
 * @example
 * <SprintPlanningProvider>
 *   <SprintPlanningView />
 * </SprintPlanningProvider>
 */
export function SprintPlanningProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SprintPlanningState>({
    selectedTasks: [],
    searchQuery: "",
    filterType: "all",
    filterPriority: "all",
    viewMode: "list",
  });

  const setSelectedTasks = (tasks: string[]) => {
    setState((prev) => ({ ...prev, selectedTasks: tasks }));
  };

  const toggleTaskSelection = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      selectedTasks: prev.selectedTasks.includes(taskId)
        ? prev.selectedTasks.filter((id) => id !== taskId)
        : [...prev.selectedTasks, taskId],
    }));
  };

  const clearSelection = () => {
    setState((prev) => ({ ...prev, selectedTasks: [] }));
  };

  const setSearchQuery = (query: string) => {
    setState((prev) => ({ ...prev, searchQuery: query }));
  };

  const setFilterType = (type: TaskType | "all") => {
    setState((prev) => ({ ...prev, filterType: type }));
  };

  const setFilterPriority = (priority: TaskPriority | "all") => {
    setState((prev) => ({ ...prev, filterPriority: priority }));
  };

  const setViewMode = (mode: "list" | "compact") => {
    setState((prev) => ({ ...prev, viewMode: mode }));
  };

  const resetFilters = () => {
    setState((prev) => ({
      ...prev,
      searchQuery: "",
      filterType: "all",
      filterPriority: "all",
    }));
  };

  const value: SprintPlanningContextValue = {
    ...state,
    setSelectedTasks,
    toggleTaskSelection,
    clearSelection,
    setSearchQuery,
    setFilterType,
    setFilterPriority,
    setViewMode,
    resetFilters,
  };

  return (
    <SprintPlanningContext.Provider value={value}>
      {children}
    </SprintPlanningContext.Provider>
  );
}

/**
 * Hook to access sprint planning context
 * @throws Error if used outside SprintPlanningProvider
 */
export function useSprintPlanning() {
  const context = useContext(SprintPlanningContext);
  if (!context) {
    throw new Error("useSprintPlanning must be used within SprintPlanningProvider");
  }
  return context;
}

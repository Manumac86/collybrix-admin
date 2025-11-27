"use client";

/**
 * PM Context Provider
 * Global state management for PM module preferences
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface PMContextType {
  // Current project
  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;

  // Active sprint
  activeSprintId: string | null;
  setActiveSprintId: (id: string | null) => void;

  // User preferences
  preferences: {
    keyboardShortcutsEnabled: boolean;
    boardViewCompact: boolean;
    autoRefreshMetrics: boolean;
    defaultTaskView: "list" | "card";
  };
  updatePreferences: (updates: Partial<PMContextType["preferences"]>) => void;
}

const PMContext = createContext<PMContextType | undefined>(undefined);

const STORAGE_KEY = "pm-preferences";

const DEFAULT_PREFERENCES: PMContextType["preferences"] = {
  keyboardShortcutsEnabled: true,
  boardViewCompact: false,
  autoRefreshMetrics: true,
  defaultTaskView: "list",
};

interface PMProviderProps {
  children: ReactNode;
}

export function PMProvider({ children }: PMProviderProps) {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [activeSprintId, setActiveSprintId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<PMContextType["preferences"]>(
    DEFAULT_PREFERENCES
  );

  // Load preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setPreferences({ ...DEFAULT_PREFERENCES, ...parsed });
        } catch (error) {
          console.error("[PM] Failed to parse preferences:", error);
        }
      }
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<PMContextType["preferences"]>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
  };

  const value: PMContextType = {
    currentProjectId,
    setCurrentProjectId,
    activeSprintId,
    setActiveSprintId,
    preferences,
    updatePreferences,
  };

  return <PMContext.Provider value={value}>{children}</PMContext.Provider>;
}

/**
 * Hook to access PM context
 */
export function usePMContext() {
  const context = useContext(PMContext);
  if (context === undefined) {
    throw new Error("usePMContext must be used within a PMProvider");
  }
  return context;
}

/**
 * Hook to access PM preferences only
 */
export function usePMPreferences() {
  const { preferences, updatePreferences } = usePMContext();
  return { preferences, updatePreferences };
}

"use client";

/**
 * Keyboard Shortcuts Handler
 * Global keyboard shortcuts for PM module
 */

import { useEffect, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcut {
  key: string;
  label: string;
  action: () => void;
  description: string;
}

interface KeyboardShortcutsProps {
  children: ReactNode;
  projectId: string;
  onNewTask?: () => void;
  onSearch?: () => void;
}

const SHORTCUT_DEFINITIONS = [
  {
    key: "?",
    label: "?",
    description: "Show keyboard shortcuts",
  },
  {
    key: "n",
    label: "N",
    description: "Create new task",
  },
  {
    key: "/",
    label: "/",
    description: "Focus search",
  },
  {
    key: "b",
    label: "B",
    description: "Go to board view",
  },
  {
    key: "l",
    label: "L",
    description: "Go to backlog",
  },
  {
    key: "s",
    label: "S",
    description: "Go to sprints",
  },
  {
    key: "m",
    label: "M",
    description: "Go to metrics",
  },
  {
    key: "Escape",
    label: "Esc",
    description: "Close dialog/panel",
  },
];

export function KeyboardShortcutsProvider({
  children,
  projectId,
  onNewTask,
  onSearch,
}: KeyboardShortcutsProps) {
  const [showHelp, setShowHelp] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Exception: allow "/" to focus search even in input
        if (e.key === "/" && !target.classList.contains("search-input")) {
          return;
        }
        // Exception: allow Escape to close dialogs
        if (e.key === "Escape") {
          // Let the event propagate for dialog close
          return;
        }
        // Otherwise, ignore shortcuts in inputs
        if (e.key !== "/" && e.key !== "Escape") {
          return;
        }
      }

      // Handle shortcuts
      switch (e.key) {
        case "?":
          e.preventDefault();
          setShowHelp(true);
          break;

        case "n":
          e.preventDefault();
          onNewTask?.();
          break;

        case "/":
          e.preventDefault();
          onSearch?.();
          break;

        case "b":
          e.preventDefault();
          router.push(`/project-management/${projectId}/board`);
          break;

        case "l":
          e.preventDefault();
          router.push(`/project-management/${projectId}/backlog`);
          break;

        case "s":
          e.preventDefault();
          router.push(`/project-management/${projectId}/sprints`);
          break;

        case "m":
          e.preventDefault();
          router.push(`/project-management/${projectId}/metrics`);
          break;

        case "Escape":
          // Escape is handled by dialog components
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [router, projectId, pathname, onNewTask, onSearch]);

  return (
    <>
      {children}

      {/* Keyboard Shortcuts Help Dialog */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Keyboard className="w-5 h-5 text-primary" />
              </div>
              <DialogTitle>Keyboard Shortcuts</DialogTitle>
            </div>
            <DialogDescription>
              Use these shortcuts to navigate and perform actions quickly
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {SHORTCUT_DEFINITIONS.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {shortcut.description}
                </span>
                <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 min-w-[2rem] text-center">
                  {shortcut.label}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Press <kbd className="px-1 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded">?</kbd> at any time to view this help
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

"use client";

import { useState } from "react";
import { Play, CheckCircle, Edit, Trash2, MoreVertical } from "lucide-react";
import { Sprint } from "@/types/pm";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SprintActionsProps {
  sprint: Sprint;
  onEdit?: () => void;
  onStart?: () => Promise<void>;
  onComplete?: () => Promise<void>;
  onDelete?: () => Promise<void>;
  isLoading?: boolean;
}

/**
 * SprintActions Component
 *
 * Dropdown menu with sprint actions
 * - Start Sprint: Confirm dialog, changes status to "active", captures committed points
 * - Complete Sprint: Confirm dialog, changes status to "completed", offers to carry over incomplete tasks
 * - Delete Sprint: Confirm dialog, unassigns all tasks, deletes sprint
 * - Edit Sprint: Opens sprint dialog
 *
 * @example
 * <SprintActions
 *   sprint={sprint}
 *   onEdit={handleEdit}
 *   onStart={handleStart}
 *   onComplete={handleComplete}
 *   onDelete={handleDelete}
 * />
 */
export function SprintActions({
  sprint,
  onEdit,
  onStart,
  onComplete,
  onDelete,
  isLoading = false,
}: SprintActionsProps) {
  const [showStartDialog, setShowStartDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = async () => {
    if (!onStart) return;
    setIsProcessing(true);
    try {
      await onStart();
      setShowStartDialog(false);
    } catch (error) {
      console.error("Failed to start sprint:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!onComplete) return;
    setIsProcessing(true);
    try {
      await onComplete();
      setShowCompleteDialog(false);
    } catch (error) {
      console.error("Failed to complete sprint:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setIsProcessing(true);
    try {
      await onDelete();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete sprint:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" disabled={isLoading}>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {onEdit && (
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Sprint
            </DropdownMenuItem>
          )}

          {sprint.status === "planning" && onStart && (
            <DropdownMenuItem onClick={() => setShowStartDialog(true)}>
              <Play className="h-4 w-4 mr-2" />
              Start Sprint
            </DropdownMenuItem>
          )}

          {sprint.status === "active" && onComplete && (
            <DropdownMenuItem onClick={() => setShowCompleteDialog(true)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Sprint
            </DropdownMenuItem>
          )}

          {sprint.status === "planning" && onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Sprint
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Start Sprint Dialog */}
      <AlertDialog open={showStartDialog} onOpenChange={setShowStartDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Start Sprint?</AlertDialogTitle>
            <AlertDialogDescription>
              This will activate the sprint and lock in the committed story points (
              {sprint.committedPoints} points). You can still add or remove tasks during
              the sprint, but this will be tracked as scope change.
              <br />
              <br />
              Are you ready to start <strong>{sprint.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleStart} disabled={isProcessing}>
              {isProcessing ? "Starting..." : "Start Sprint"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Sprint Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Sprint?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the sprint as completed with {sprint.completedPoints} out of{" "}
              {sprint.committedPoints} points completed (
              {Math.round((sprint.completedPoints / sprint.committedPoints) * 100)}%).
              <br />
              <br />
              Any incomplete tasks will remain in the sprint. You can manually move them to
              the next sprint or back to the backlog.
              <br />
              <br />
              Are you ready to complete <strong>{sprint.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} disabled={isProcessing}>
              {isProcessing ? "Completing..." : "Complete Sprint"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Sprint Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sprint?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will permanently delete <strong>{sprint.name}</strong>. All tasks
                currently assigned to this sprint will be unassigned and moved back to the
                backlog.
              </p>
              <p className="text-red-600 font-medium">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isProcessing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Deleting..." : "Delete Sprint"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

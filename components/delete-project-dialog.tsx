"use client"

import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { projectsData } from "@/lib/data"

interface DeleteProjectDialogProps {
  projectId: number
  projectName: string
  onDelete?: () => void
}

export function DeleteProjectDialog({ projectId, projectName, onDelete }: DeleteProjectDialogProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = () => {
    const index = projectsData.findIndex((p) => p.id === projectId)
    if (index !== -1) {
      projectsData.splice(index, 1)
    }
    setIsOpen(false)
    if (onDelete) {
      onDelete()
    }
    // If viewing detail page, redirect to projects
    router.push("/projects")
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{projectName}</strong>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end gap-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}

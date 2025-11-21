"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

const milestoneTypes = [
  { value: "kickoff", label: "Kickoff" },
  { value: "design", label: "Design" },
  { value: "development", label: "Development" },
  { value: "testing", label: "Testing" },
  { value: "analysis", label: "Analysis" },
  { value: "implementation", label: "Implementation" },
  { value: "launch", label: "Launch" },
]

interface AddMilestoneDialogProps {
  onAddMilestone: (milestone: {
    date: string
    type: string
    name: string
    description: string
    deliverable: string
  }) => void
}

export function AddMilestoneDialog({ onAddMilestone }: AddMilestoneDialogProps) {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState("")
  const [type, setType] = useState("")
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [deliverable, setDeliverable] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || !type || !name || !description || !deliverable) {
      alert("Please fill in all fields")
      return
    }

    onAddMilestone({
      date,
      type,
      name,
      description,
      deliverable,
    })

    setDate("")
    setType("")
    setName("")
    setDescription("")
    setDeliverable("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          Add Milestone
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Milestone</DialogTitle>
          <DialogDescription>Add a new milestone to the project timeline.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Milestone Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {milestoneTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Milestone Name</Label>
            <Input
              id="name"
              placeholder="e.g., Design Review Complete"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe what this milestone represents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deliverable">Deliverable</Label>
            <Input
              id="deliverable"
              placeholder="e.g., Design mockups and wireframes"
              value={deliverable}
              onChange={(e) => setDeliverable(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              Add Milestone
            </Button>
            <Button type="button" variant="outline" className="flex-1 bg-transparent" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

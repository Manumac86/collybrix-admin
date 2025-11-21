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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil } from "lucide-react"

const pipelineStates = [
  "scouting",
  "initial contact",
  "qualification",
  "discovery",
  "technical evaluation",
  "due diligence",
  "presentation",
  "negotiation",
  "terms",
  "closing",
  "to start",
  "in progress",
  "finished",
]

const projectTypes = ["Accelleration", "Software Factory", "Consulting", "SaaS"]
const paymentStatuses = ["paid", "partial", "pending"]

interface Project {
  id: number
  name: string
  company: string
  pipelineState: string
  projectType: string
  initialPricing: number
  finalPrice: number | null
  mmr: number | null
  paymentStatus: string
  status: string
  startedDate: string
  description: string
  docsLink: string
}

interface EditProjectDialogProps {
  project: Project
  onSave: (updatedProject: Project) => void
}

export function EditProjectDialog({ project, onSave }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: project.name,
    company: project.company,
    pipelineState: project.pipelineState,
    projectType: project.projectType,
    initialPricing: project.initialPricing.toString(),
    finalPrice: project.finalPrice?.toString() || "",
    mmr: project.mmr?.toString() || "",
    paymentStatus: project.paymentStatus,
    status: project.status,
    description: project.description,
    docsLink: project.docsLink,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedProject: Project = {
      ...project,
      name: formData.name,
      company: formData.company,
      pipelineState: formData.pipelineState,
      projectType: formData.projectType,
      initialPricing: Number(formData.initialPricing),
      finalPrice: formData.finalPrice ? Number(formData.finalPrice) : null,
      mmr: formData.mmr ? Number(formData.mmr) : null,
      paymentStatus: formData.paymentStatus,
      status: formData.status,
      description: formData.description,
      docsLink: formData.docsLink,
    }
    onSave(updatedProject)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <Pencil className="w-4 h-4" />
          Edit Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>Update project details and information</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pipeline">Pipeline State *</Label>
              <Select
                value={formData.pipelineState}
                onValueChange={(value) => setFormData({ ...formData, pipelineState: value })}
              >
                <SelectTrigger id="pipeline">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pipelineStates.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Project Type *</Label>
              <Select
                value={formData.projectType}
                onValueChange={(value) => setFormData({ ...formData, projectType: value })}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {projectTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialPrice">Initial Pricing (€) *</Label>
              <Input
                id="initialPrice"
                type="number"
                value={formData.initialPricing}
                onChange={(e) => setFormData({ ...formData, initialPricing: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalPrice">Final Price (€)</Label>
              <Input
                id="finalPrice"
                type="number"
                value={formData.finalPrice}
                onChange={(e) => setFormData({ ...formData, finalPrice: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mmr">MMR (€)</Label>
              <Input
                id="mmr"
                type="number"
                value={formData.mmr}
                onChange={(e) => setFormData({ ...formData, mmr: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment">Payment Status *</Label>
              <Select
                value={formData.paymentStatus}
                onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
              >
                <SelectTrigger id="payment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border border-input rounded-md text-sm"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="docsLink">Documentation Link</Label>
            <Input
              id="docsLink"
              type="url"
              value={formData.docsLink}
              onChange={(e) => setFormData({ ...formData, docsLink: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

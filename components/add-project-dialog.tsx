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
import { Plus } from "lucide-react"

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

export function AddProjectDialog() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    pipelineState: "scouting",
    projectType: "Software Factory",
    initialPricing: "",
    finalPrice: "",
    mmr: "",
    paymentStatus: "pending",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Add project to database/state management
    console.log("New project:", formData)
    setOpen(false)
    setFormData({
      name: "",
      company: "",
      pipelineState: "scouting",
      projectType: "Software Factory",
      initialPricing: "",
      finalPrice: "",
      mmr: "",
      paymentStatus: "pending",
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>Create a new project and add it to your portfolio</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                placeholder="e.g., E-commerce Platform"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            {/* Company */}
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Input
                id="company"
                placeholder="e.g., TechStartup Inc"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                required
              />
            </div>

            {/* Pipeline State */}
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

            {/* Project Type */}
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

            {/* Initial Pricing */}
            <div className="space-y-2">
              <Label htmlFor="initialPrice">Initial Pricing (€) *</Label>
              <Input
                id="initialPrice"
                type="number"
                placeholder="0"
                value={formData.initialPricing}
                onChange={(e) => setFormData({ ...formData, initialPricing: e.target.value })}
                required
              />
            </div>

            {/* Final Price */}
            <div className="space-y-2">
              <Label htmlFor="finalPrice">Final Price (€)</Label>
              <Input
                id="finalPrice"
                type="number"
                placeholder="0"
                value={formData.finalPrice}
                onChange={(e) => setFormData({ ...formData, finalPrice: e.target.value })}
              />
            </div>

            {/* MMR */}
            <div className="space-y-2">
              <Label htmlFor="mmr">MMR (€)</Label>
              <Input
                id="mmr"
                type="number"
                placeholder="0"
                value={formData.mmr}
                onChange={(e) => setFormData({ ...formData, mmr: e.target.value })}
              />
            </div>

            {/* Payment Status */}
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

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} type="button">
              Cancel
            </Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

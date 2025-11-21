"use client"

import { useState } from "react"
import { AddMilestoneDialog } from "./add-milestone-dialog"
import { ChevronRight } from "lucide-react"

interface Milestone {
  date: string
  type: string
  name: string
  description: string
  deliverable: string
}

interface ProjectTimelineProps {
  milestones: Milestone[]
  onAddMilestone?: (milestone: Milestone) => void
}

export function ProjectTimeline({ milestones, onAddMilestone }: ProjectTimelineProps) {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null)
  const [displayedMilestones, setDisplayedMilestones] = useState<Milestone[]>(milestones)

  const handleAddMilestone = (newMilestone: Milestone) => {
    const updatedMilestones = [...displayedMilestones, newMilestone]
    setDisplayedMilestones(updatedMilestones)
    onAddMilestone?.(newMilestone)
  }

  const milestoneTypeColors: Record<string, string> = {
    kickoff: "bg-blue-500 ring-blue-200",
    design: "bg-purple-500 ring-purple-200",
    development: "bg-emerald-500 ring-emerald-200",
    testing: "bg-amber-500 ring-amber-200",
    analysis: "bg-indigo-500 ring-indigo-200",
    implementation: "bg-pink-500 ring-pink-200",
    launch: "bg-red-500 ring-red-200",
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Project Timeline</h2>
          <p className="text-sm text-muted-foreground mt-1">Milestones and key project dates</p>
        </div>
        <AddMilestoneDialog onAddMilestone={handleAddMilestone} />
      </div>

      {/* Timeline Content */}
      {displayedMilestones.length === 0 ? (
        <div className="flex items-center justify-center py-12 rounded-lg border-2 border-dashed border-border">
          <p className="text-muted-foreground">No milestones defined yet. Click the button above to add one.</p>
        </div>
      ) : (
        <div className="relative space-y-8 pt-4">
          {/* Vertical Timeline Line */}
          <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary to-border" />

          {/* Milestones */}
          {displayedMilestones.map((milestone, index) => (
            <div key={index} className="relative pl-20">
              {/* Milestone Dot */}
              <div
                className={`absolute -left-3 w-16 h-16 rounded-full border-4 border-background flex items-center justify-center cursor-pointer transition-all duration-300 ${
                  milestoneTypeColors[milestone.type] || "bg-gray-500 ring-gray-200"
                } ${hoveredMilestone === index ? "scale-110 shadow-xl ring-4" : "scale-100 shadow-md"}`}
                onMouseEnter={() => setHoveredMilestone(index)}
                onMouseLeave={() => setHoveredMilestone(null)}
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </div>

              {/* Tooltip on Hover */}
              {hoveredMilestone === index && (
                <div className="absolute -left-24 bottom-full mb-4 bg-foreground text-background px-4 py-3 rounded-lg shadow-lg z-10 whitespace-nowrap">
                  <div className="font-bold text-sm">{milestone.name}</div>
                  <div className="text-xs opacity-90">
                    {new Date(milestone.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </div>
                  <div className="absolute top-full left-6 border-4 border-transparent border-t-foreground" />
                </div>
              )}

              {/* Milestone Content */}
              <div
                className={`p-4 rounded-lg border border-border transition-all duration-300 ${
                  hoveredMilestone === index
                    ? "bg-secondary/50 border-primary shadow-md"
                    : "bg-background hover:bg-secondary/30"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{milestone.name}</h3>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mt-1">
                      {milestone.type}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {new Date(milestone.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>

                <div className="pt-3 border-t border-border">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">Deliverable:</span>{" "}
                    <span className="text-muted-foreground">{milestone.deliverable}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

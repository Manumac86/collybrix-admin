"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { TeamMember } from "@/types/estimation";
import { calculateTeamMemberCost, formatCurrency } from "@/lib/estimation-utils";

interface TeamMemberInputProps {
  teamMembers: TeamMember[];
  onChange: (teamMembers: TeamMember[]) => void;
}

export function TeamMemberInput({ teamMembers, onChange }: TeamMemberInputProps) {
  const addTeamMember = () => {
    const newMember: TeamMember = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      role: "",
      dailyRate: 0,
      daysAllocated: 0,
      totalCost: 0,
    };
    onChange([...teamMembers, newMember]);
  };

  const removeTeamMember = (id: string) => {
    onChange(teamMembers.filter((member) => member.id !== id));
  };

  const updateTeamMember = (id: string, field: keyof TeamMember, value: any) => {
    const updated = teamMembers.map((member) => {
      if (member.id === id) {
        const updatedMember = { ...member, [field]: value };
        // Recalculate total cost when daily rate or days change
        if (field === "dailyRate" || field === "daysAllocated") {
          updatedMember.totalCost = calculateTeamMemberCost(
            updatedMember.dailyRate,
            updatedMember.daysAllocated
          );
        }
        return updatedMember;
      }
      return member;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Team Members</Label>
        <Button type="button" variant="outline" size="sm" onClick={addTeamMember}>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {teamMembers.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No team members added yet. Click "Add Member" to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {teamMembers.map((member) => (
            <Card key={member.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {member.name || "New Team Member"}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeamMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${member.id}`}>Name *</Label>
                    <Input
                      id={`name-${member.id}`}
                      placeholder="e.g., John Doe"
                      value={member.name}
                      onChange={(e) => updateTeamMember(member.id, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`role-${member.id}`}>Role *</Label>
                    <Input
                      id={`role-${member.id}`}
                      placeholder="e.g., Senior Developer"
                      value={member.role}
                      onChange={(e) => updateTeamMember(member.id, "role", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`rate-${member.id}`}>Daily Rate (€) *</Label>
                    <Input
                      id={`rate-${member.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="500"
                      value={member.dailyRate || ""}
                      onChange={(e) =>
                        updateTeamMember(member.id, "dailyRate", parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`days-${member.id}`}>Days Allocated *</Label>
                    <Input
                      id={`days-${member.id}`}
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="20"
                      value={member.daysAllocated || ""}
                      onChange={(e) =>
                        updateTeamMember(member.id, "daysAllocated", parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Cost:</span>
                    <span className="text-base font-semibold">
                      {formatCurrency(member.totalCost)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

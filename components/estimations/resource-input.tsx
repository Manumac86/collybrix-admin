"use client";

import type React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { Resource } from "@/types/estimation";
import { formatCurrency } from "@/lib/estimation-utils";

interface ResourceInputProps {
  resources: Resource[];
  onChange: (resources: Resource[]) => void;
}

export function ResourceInput({ resources, onChange }: ResourceInputProps) {
  const addResource = () => {
    const newResource: Resource = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      type: "software",
      cost: 0,
      frequency: "one-time",
      description: "",
    };
    onChange([...resources, newResource]);
  };

  const removeResource = (id: string) => {
    onChange(resources.filter((resource) => resource.id !== id));
  };

  const updateResource = (id: string, field: keyof Resource, value: any) => {
    const updated = resources.map((resource) => {
      if (resource.id === id) {
        return { ...resource, [field]: value };
      }
      return resource;
    });
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Resources & Tools</Label>
        <Button type="button" variant="outline" size="sm" onClick={addResource}>
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {resources.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No resources added yet. Click "Add Resource" to include software, hardware, or
            services.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {resources.map((resource) => (
            <Card key={resource.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {resource.name || "New Resource"}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeResource(resource.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`res-name-${resource.id}`}>Name *</Label>
                    <Input
                      id={`res-name-${resource.id}`}
                      placeholder="e.g., AWS Hosting"
                      value={resource.name}
                      onChange={(e) => updateResource(resource.id, "name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`res-type-${resource.id}`}>Type *</Label>
                    <Select
                      value={resource.type}
                      onValueChange={(value) => updateResource(resource.id, "type", value)}
                    >
                      <SelectTrigger id={`res-type-${resource.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="hardware">Hardware</SelectItem>
                        <SelectItem value="service">Service</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`res-cost-${resource.id}`}>Cost (€) *</Label>
                    <Input
                      id={`res-cost-${resource.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="100"
                      value={resource.cost || ""}
                      onChange={(e) =>
                        updateResource(resource.id, "cost", parseFloat(e.target.value) || 0)
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`res-freq-${resource.id}`}>Frequency *</Label>
                    <Select
                      value={resource.frequency}
                      onValueChange={(value) => updateResource(resource.id, "frequency", value)}
                    >
                      <SelectTrigger id={`res-freq-${resource.id}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`res-desc-${resource.id}`}>Description</Label>
                  <Input
                    id={`res-desc-${resource.id}`}
                    placeholder="Brief description..."
                    value={resource.description || ""}
                    onChange={(e) => updateResource(resource.id, "description", e.target.value)}
                  />
                </div>
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Cost ({resource.frequency}):
                    </span>
                    <span className="text-base font-semibold">
                      {formatCurrency(resource.cost)}
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

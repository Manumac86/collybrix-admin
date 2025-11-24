"use client";

import type React from "react";
import { useState } from "react";
import { EstimationCard } from "./estimation-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEstimations, useDeleteEstimation } from "@/hooks/estimations";
import { Search, Filter } from "lucide-react";
import type { Estimation } from "@/types/estimation";

export function EstimationList() {
  const { estimations, isLoading, error } = useEstimations();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { trigger: deleteEstimation } = useDeleteEstimation(null);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this estimation?")) {
      try {
        await deleteEstimation();
        // The hook will automatically revalidate the list
      } catch (error) {
        console.error("[v0] Error deleting estimation:", error);
      }
    }
  };

  // Filter estimations
  const filteredEstimations = estimations.filter((estimation: Estimation) => {
    const matchesSearch =
      estimation.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      estimation.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || estimation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">Error loading estimations: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by project or client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {filteredEstimations.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== "all"
              ? "No estimations match your filters"
              : "No estimations yet. Create your first one!"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEstimations.map((estimation: Estimation) => (
            <EstimationCard
              key={estimation._id?.toString()}
              estimation={estimation}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

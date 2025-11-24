"use client";

import type React from "react";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { EstimationList } from "@/components/estimations/estimation-list";
import { AddEstimationDialog } from "@/components/estimations/add-estimation-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEstimationStats } from "@/hooks/estimations";
import { formatCurrency } from "@/lib/estimation-utils";
import { FileText, DollarSign, TrendingUp, CheckCircle } from "lucide-react";

export default function ProjectEstimationPage() {
  const {
    totalEstimations,
    totalValue,
    averageValue,
    statusCounts,
    isLoading,
  } = useEstimationStats();

  return (
    <LayoutWrapper>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Project Estimations</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage project cost estimations
            </p>
          </div>
          <AddEstimationDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Estimations
              </CardTitle>
              <FileText className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "-" : totalEstimations}
              </div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              <DollarSign className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "-" : formatCurrency(totalValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Combined final prices
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average Value
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "-" : formatCurrency(averageValue)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per estimation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? "-" : statusCounts.approved}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {statusCounts.sent} sent, {statusCounts.draft} drafts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estimations List */}
        <EstimationList />
      </div>
    </LayoutWrapper>
  );
}

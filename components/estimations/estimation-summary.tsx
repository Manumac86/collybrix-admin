"use client";

import type React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { EstimationCalculations } from "@/types/estimation";
import { formatCurrency } from "@/lib/estimation-utils";
import { Calculator, TrendingUp, DollarSign, Package } from "lucide-react";

interface EstimationSummaryProps {
  calculations: EstimationCalculations;
  revenuePercentage: number;
}

export function EstimationSummary({
  calculations,
  revenuePercentage,
}: EstimationSummaryProps) {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Estimation Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>Team Cost:</span>
            </div>
            <span className="font-medium">{formatCurrency(calculations.teamCost)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Package className="w-4 h-4" />
              <span>Resources Cost:</span>
            </div>
            <span className="font-medium">{formatCurrency(calculations.resourcesCost)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold">Total Cost:</span>
            <span className="font-semibold">{formatCurrency(calculations.totalCost)}</span>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Revenue ({revenuePercentage}%):</span>
            </div>
            <span className="font-medium text-green-600">
              +{formatCurrency(calculations.revenueAmount)}
            </span>
          </div>

          <Separator className="border-2" />

          <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="font-bold">Final Price:</span>
            </div>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(calculations.finalPrice)}
            </span>
          </div>
        </div>

        <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
          <p>Total Cost = Team Cost + Resources Cost</p>
          <p>Revenue = Total Cost × {revenuePercentage}%</p>
          <p>Final Price = Total Cost + Revenue</p>
        </div>
      </CardContent>
    </Card>
  );
}

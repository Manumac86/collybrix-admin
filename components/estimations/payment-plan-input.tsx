"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PaymentPlan } from "@/types/estimation";
import { formatCurrency } from "@/lib/estimation-utils";

interface PaymentPlanInputProps {
  paymentPlan: PaymentPlan | undefined;
  finalPrice: number;
  onChange: (paymentPlan: PaymentPlan | undefined) => void;
}

export function PaymentPlanInput({
  paymentPlan,
  finalPrice,
  onChange,
}: PaymentPlanInputProps) {
  const handleEnabledChange = (enabled: boolean) => {
    if (enabled) {
      onChange({
        enabled: true,
        numberOfMonths: 6,
        monthlyAmount: finalPrice / 6,
        startDate: new Date().toISOString().split("T")[0],
      });
    } else {
      onChange(undefined);
    }
  };

  const handleMonthsChange = (months: number) => {
    if (paymentPlan) {
      onChange({
        ...paymentPlan,
        numberOfMonths: months,
        monthlyAmount: finalPrice / months,
      });
    }
  };

  const handleStartDateChange = (date: string) => {
    if (paymentPlan) {
      onChange({
        ...paymentPlan,
        startDate: date,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Payment Plan</CardTitle>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300"
              checked={paymentPlan?.enabled || false}
              onChange={(e) => handleEnabledChange(e.target.checked)}
            />
            <span className="text-sm">Enable monthly payments</span>
          </label>
        </div>
      </CardHeader>
      {paymentPlan?.enabled && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-months">Number of Months *</Label>
              <Input
                id="payment-months"
                type="number"
                min="1"
                max="60"
                value={paymentPlan.numberOfMonths}
                onChange={(e) => handleMonthsChange(parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-start">Start Date</Label>
              <Input
                id="payment-start"
                type="date"
                value={paymentPlan.startDate || ""}
                onChange={(e) => handleStartDateChange(e.target.value)}
              />
            </div>
          </div>
          <div className="p-4 bg-muted rounded-md">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monthly Payment:</span>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(paymentPlan.monthlyAmount)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {paymentPlan.numberOfMonths} months x {formatCurrency(paymentPlan.monthlyAmount)} ={" "}
              {formatCurrency(finalPrice)}
            </p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

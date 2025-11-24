"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TeamMemberInput } from "./team-member-input";
import { ResourceInput } from "./resource-input";
import { PaymentPlanInput } from "./payment-plan-input";
import { EstimationSummary } from "./estimation-summary";
import type { Estimation, TeamMember, Resource, PaymentPlan } from "@/types/estimation";
import { calculateEstimation } from "@/lib/estimation-utils";
import { Loader2 } from "lucide-react";

interface EstimationFormProps {
  initialData?: Estimation;
  onSubmit: (data: Partial<Estimation>) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function EstimationForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = "Create Estimation",
}: EstimationFormProps) {
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState(initialData?.projectName || "");
  const [clientName, setClientName] = useState(initialData?.clientName || "");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(
    initialData?.teamMembers || []
  );
  const [resources, setResources] = useState<Resource[]>(initialData?.resources || []);
  const [revenuePercentage, setRevenuePercentage] = useState(
    initialData?.revenuePercentage || 20
  );
  const [paymentPlan, setPaymentPlan] = useState<PaymentPlan | undefined>(
    initialData?.paymentPlan
  );
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [status, setStatus] = useState<"draft" | "sent" | "approved" | "rejected">(
    initialData?.status || "draft"
  );

  // Calculate totals in real-time
  const calculations = calculateEstimation(teamMembers, resources, revenuePercentage);

  // Update payment plan when final price changes
  useEffect(() => {
    if (paymentPlan?.enabled) {
      setPaymentPlan({
        ...paymentPlan,
        monthlyAmount: calculations.finalPrice / paymentPlan.numberOfMonths,
      });
    }
  }, [calculations.finalPrice]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const estimationData: Partial<Estimation> = {
        projectName,
        clientName,
        teamMembers,
        resources,
        revenuePercentage,
        totalCost: calculations.totalCost,
        totalRevenue: calculations.revenueAmount,
        finalPrice: calculations.finalPrice,
        paymentPlan,
        notes,
        status,
      };

      await onSubmit(estimationData);
    } catch (error) {
      console.error("[v0] Error submitting estimation:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name *</Label>
                  <Input
                    id="projectName"
                    placeholder="e.g., E-commerce Platform"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input
                    id="clientName"
                    placeholder="e.g., TechStartup Inc"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="revenuePercentage">Revenue Percentage *</Label>
                  <Input
                    id="revenuePercentage"
                    type="number"
                    min="0"
                    max="100"
                    step="1"
                    placeholder="20"
                    value={revenuePercentage}
                    onChange={(e) => setRevenuePercentage(parseFloat(e.target.value) || 0)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Profit margin added to total cost
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="sent">Sent</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Team Members */}
          <TeamMemberInput teamMembers={teamMembers} onChange={setTeamMembers} />

          <Separator />

          {/* Resources */}
          <ResourceInput resources={resources} onChange={setResources} />

          <Separator />

          {/* Payment Plan */}
          <PaymentPlanInput
            paymentPlan={paymentPlan}
            finalPrice={calculations.finalPrice}
            onChange={setPaymentPlan}
          />

          <Separator />

          {/* Notes */}
          <Card>
            <CardContent className="pt-6 space-y-4">
              <h3 className="font-semibold text-lg">Additional Notes</h3>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes, assumptions, or considerations..."
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <EstimationSummary
            calculations={calculations}
            revenuePercentage={revenuePercentage}
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} type="button" disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading || teamMembers.length === 0}>
          {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

"use client";

import React from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { EstimationForm } from "@/components/estimations/estimation-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  useEstimation,
  useUpdateEstimation,
  useDeleteEstimation,
} from "@/hooks/estimations";
import type { Estimation } from "@/types/estimation";
import { formatCurrency } from "@/lib/estimation-utils";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  Package,
  Calendar,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function EstimationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { estimation, isLoading, error } = useEstimation(resolvedParams.id);
  const { trigger: updateEstimation } = useUpdateEstimation(resolvedParams.id);
  const { trigger: deleteEstimation } = useDeleteEstimation(resolvedParams.id);
  const [isEditing, setIsEditing] = React.useState(false);

  const handleUpdate = async (data: Partial<Estimation>) => {
    try {
      await updateEstimation(data);
      setIsEditing(false);
    } catch (error) {
      console.error("[v0] Error updating estimation:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEstimation();
      router.push("/project-estimation");
    } catch (error) {
      console.error("[v0] Error deleting estimation:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !estimation) {
    return (
      <div className="text-center py-12">
        <p className="text-destructive">
          Error loading estimation: {error || "Not found"}
        </p>
        <Button asChild className="mt-4">
          <Link href="/project-estimation">Back to Estimations</Link>
        </Button>
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Estimation</h1>
            <p className="text-muted-foreground mt-1">
              {estimation.projectName}
            </p>
          </div>
        </div>
        <EstimationForm
          initialData={estimation}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitLabel="Update Estimation"
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/project-estimation">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{estimation.projectName}</h1>
            <p className="text-muted-foreground mt-1">
              {estimation.clientName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge className={statusColors[estimation.status]}>
            {estimation.status}
          </Badge>
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this estimation.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Final Price</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(estimation.finalPrice)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total cost + {estimation.revenuePercentage}% revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Cost</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(estimation.totalCost)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {estimation.teamMembers.length} team members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resources</CardTitle>
            <Package className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {estimation.resources.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Items included</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {estimation.teamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-muted rounded-md"
              >
                <div>
                  <p className="font-medium">{member.name}</p>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {formatCurrency(member.totalCost)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(member.dailyRate)}/day -{" "}
                    {member.daysAllocated} days
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      {estimation.resources.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resources & Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {estimation.resources.map((resource) => (
                <div
                  key={resource.id}
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                >
                  <div>
                    <p className="font-medium">{resource.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {resource.type} - {resource.frequency}
                    </p>
                    {resource.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {resource.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatCurrency(resource.cost)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Plan */}
      {estimation.paymentPlan?.enabled && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Payment:</span>
                <span className="font-bold">
                  {formatCurrency(estimation.paymentPlan.monthlyAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Number of Months:</span>
                <span>{estimation.paymentPlan.numberOfMonths}</span>
              </div>
              {estimation.paymentPlan.startDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span>
                    {new Date(
                      estimation.paymentPlan.startDate
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      {estimation.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{estimation.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>
              Created on{" "}
              {estimation.createdAt
                ? new Date(estimation.createdAt).toLocaleDateString()
                : "N/A"}
            </span>
            {estimation.updatedAt &&
              new Date(estimation.updatedAt).getTime() !==
                new Date(estimation.createdAt || "").getTime() && (
                <>
                  <span>"</span>
                  <span>
                    Updated on{" "}
                    {new Date(estimation.updatedAt).toLocaleDateString()}
                  </span>
                </>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import type React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Estimation } from "@/types/estimation";
import { formatCurrency } from "@/lib/estimation-utils";
import { MoreVertical, Eye, Edit, Trash2, Calendar, Users, Package } from "lucide-react";

interface EstimationCardProps {
  estimation: Estimation;
  onDelete?: (id: string) => void;
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  sent: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export function EstimationCard({ estimation, onDelete }: EstimationCardProps) {
  const estimationId = estimation._id?.toString();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{estimation.projectName}</CardTitle>
            <p className="text-sm text-muted-foreground">{estimation.clientName}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusColors[estimation.status]}>{estimation.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link
                    href={`/project-estimation/${estimationId}`}
                    className="flex items-center"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href={`/project-estimation/${estimationId}/edit`}
                    className="flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => estimationId && onDelete?.(estimationId)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-3 h-3" />
              <span>Team</span>
            </div>
            <p className="font-medium">{estimation.teamMembers?.length || 0} members</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Package className="w-3 h-3" />
              <span>Resources</span>
            </div>
            <p className="font-medium">{estimation.resources?.length || 0} items</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>Created</span>
            </div>
            <p className="font-medium">
              {estimation.createdAt
                ? new Date(estimation.createdAt).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Final Price:</span>
            <span className="text-xl font-bold text-primary">
              {formatCurrency(estimation.finalPrice)}
            </span>
          </div>
          {estimation.paymentPlan?.enabled && (
            <p className="text-xs text-muted-foreground mt-1">
              {estimation.paymentPlan.numberOfMonths} monthly payments of{" "}
              {formatCurrency(estimation.paymentPlan.monthlyAmount)}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

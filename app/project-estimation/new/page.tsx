"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { EstimationForm } from "@/components/estimations/estimation-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCreateEstimation } from "@/hooks/estimations";
import type { Estimation } from "@/types/estimation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewEstimationPage() {
  const router = useRouter();
  const { trigger: createEstimation, isMutating } = useCreateEstimation();

  const handleSubmit = async (data: Partial<Estimation>) => {
    try {
      await createEstimation(data);
      router.push("/project-estimation");
    } catch (error) {
      console.error("[v0] Error creating estimation:", error);
    }
  };

  const handleCancel = () => {
    router.push("/project-estimation");
  };

  return (
    <LayoutWrapper>
      <div className="space-y-6 p-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/project-estimation">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">New Estimation</h1>
            <p className="text-muted-foreground mt-1">
              Create a detailed cost estimation for a new project
            </p>
          </div>
        </div>

        {/* Form */}
        <EstimationForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Estimation"
        />
      </div>
    </LayoutWrapper>
  );
}

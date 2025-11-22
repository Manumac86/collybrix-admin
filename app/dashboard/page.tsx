"use client"

import { LayoutWrapper } from "@/components/layout-wrapper"
import { DashboardContent } from "@/components/dashboard-content"
import { SeedDatabaseButton } from "@/components/seed-database-button"

export default function DashboardPage() {
  return (
    <LayoutWrapper>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <SeedDatabaseButton />
      </div>
      <DashboardContent />
    </LayoutWrapper>
  )
}

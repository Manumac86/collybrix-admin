"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function SeedDatabaseButton() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSeed = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/seed", { method: "POST" })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to seed database")
      }

      toast({
        title: "Success",
        description: data.message,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to seed database",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleSeed} disabled={isLoading} variant="outline" size="sm" className="gap-2 bg-transparent">
      <Database className="w-4 h-4" />
      {isLoading ? "Seeding..." : "Seed Database"}
    </Button>
  )
}

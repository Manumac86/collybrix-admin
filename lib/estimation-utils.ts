import type { TeamMember, Resource, EstimationCalculations, Estimation } from "@/types/estimation";

export function calculateTeamMemberCost(dailyRate: number, daysAllocated: number): number {
  return dailyRate * daysAllocated;
}

export function calculateEstimation(
  teamMembers: TeamMember[],
  resources: Resource[],
  revenuePercentage: number
): EstimationCalculations {
  // Calculate total team cost
  const teamCost = teamMembers.reduce((sum, member) => {
    return sum + calculateTeamMemberCost(member.dailyRate, member.daysAllocated);
  }, 0);

  // Calculate total resources cost
  const resourcesCost = resources.reduce((sum, resource) => {
    let cost = resource.cost;

    // Annualize monthly costs for better comparison
    if (resource.frequency === "monthly") {
      cost = resource.cost * 12;
    } else if (resource.frequency === "yearly") {
      cost = resource.cost;
    }
    // one-time costs are already correct

    return sum + cost;
  }, 0);

  // Calculate total cost
  const totalCost = teamCost + resourcesCost;

  // Calculate revenue amount (percentage of total cost)
  const revenueAmount = (totalCost * revenuePercentage) / 100;

  // Calculate final price (total cost + revenue)
  const finalPrice = totalCost + revenueAmount;

  return {
    teamCost,
    resourcesCost,
    totalCost,
    revenueAmount,
    finalPrice,
  };
}

export function formatCurrency(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function validateEstimation(data: Partial<Estimation>): string[] {
  const errors: string[] = [];

  if (!data.projectName || data.projectName.trim() === "") {
    errors.push("Project name is required");
  }

  if (!data.clientName || data.clientName.trim() === "") {
    errors.push("Client name is required");
  }

  if (!data.teamMembers || data.teamMembers.length === 0) {
    errors.push("At least one team member is required");
  }

  if (data.teamMembers) {
    data.teamMembers.forEach((member, index) => {
      if (!member.name || member.name.trim() === "") {
        errors.push(`Team member ${index + 1}: Name is required`);
      }
      if (!member.role || member.role.trim() === "") {
        errors.push(`Team member ${index + 1}: Role is required`);
      }
      if (member.dailyRate <= 0) {
        errors.push(`Team member ${index + 1}: Daily rate must be greater than 0`);
      }
      if (member.daysAllocated <= 0) {
        errors.push(`Team member ${index + 1}: Days allocated must be greater than 0`);
      }
    });
  }

  if (data.resources) {
    data.resources.forEach((resource, index) => {
      if (!resource.name || resource.name.trim() === "") {
        errors.push(`Resource ${index + 1}: Name is required`);
      }
      if (resource.cost < 0) {
        errors.push(`Resource ${index + 1}: Cost cannot be negative`);
      }
    });
  }

  if (data.revenuePercentage !== undefined && (data.revenuePercentage < 0 || data.revenuePercentage > 100)) {
    errors.push("Revenue percentage must be between 0 and 100");
  }

  if (data.paymentPlan?.enabled) {
    if (data.paymentPlan.numberOfMonths <= 0) {
      errors.push("Payment plan: Number of months must be greater than 0");
    }
  }

  return errors;
}

export function generateUniqueId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

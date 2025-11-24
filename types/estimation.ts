export interface TeamMember {
  id: string;
  name: string;
  role: string;
  dailyRate: number;
  daysAllocated: number;
  totalCost: number;
}

export interface Resource {
  id: string;
  name: string;
  type: "software" | "hardware" | "service" | "other";
  cost: number;
  frequency: "one-time" | "monthly" | "yearly";
  description?: string;
}

export interface PaymentPlan {
  enabled: boolean;
  numberOfMonths: number;
  monthlyAmount: number;
  startDate?: string;
}

export interface Estimation {
  _id?: string;
  projectName: string;
  clientName: string;
  teamMembers: TeamMember[];
  resources: Resource[];
  revenuePercentage: number;
  totalCost: number;
  totalRevenue: number;
  finalPrice: number;
  paymentPlan?: PaymentPlan;
  notes?: string;
  status: "draft" | "sent" | "approved" | "rejected";
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EstimationFormData {
  projectName: string;
  clientName: string;
  teamMembers: TeamMember[];
  resources: Resource[];
  revenuePercentage: number;
  paymentPlan?: PaymentPlan;
  notes?: string;
  status: "draft" | "sent" | "approved" | "rejected";
}

export interface EstimationCalculations {
  teamCost: number;
  resourcesCost: number;
  totalCost: number;
  revenueAmount: number;
  finalPrice: number;
}

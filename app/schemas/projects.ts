import { z } from "zod";

export const MilestoneSchema = z.object({
  date: z.string(),
  type: z.string(),
  name: z.string(),
  description: z.string(),
  deliverable: z.string(),
});

export const ProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  company: z.string(),
  status: z.string(),
  startedDate: z.string(),
  pipelineState: z.string(),
  initialPricing: z.number(),
  finalPrice: z.number(),
  projectType: z.string(),
  mmr: z.number(),
  paymentStatus: z.string(),
  description: z.string(),
  docsLink: z.string(),
  milestones: z.array(MilestoneSchema),
});

export type Project = z.infer<typeof ProjectSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;

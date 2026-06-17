import { z } from 'zod';
import type { AnalysisOutput } from '@/types/program';

export const RequirementSchema = z.object({
  key: z.enum(['income', 'residency', 'citizenship', 'household', 'age', 'status', 'event', 'enrollment']),
  met: z.enum(['yes', 'no', 'unknown']),
  detail: z.string(),
});

export const MatchSchema = z.object({
  program_id: z.string(),
  eligible: z.boolean(),
  confidence: z.enum(['high', 'medium', 'low']),
  estimated_annual_value: z.number(),
  reasoning: z.string(),
  // Optional so pre-rebake fixtures (which lack this field) still parse cleanly.
  requirements: z.array(RequirementSchema).optional(),
  next_steps: z.array(z.string()),
  required_documents: z.array(z.string()),
  application_deadline: z.string().nullable().optional(),
  urgency_note: z.string().nullable().optional(),
});

export const AnalysisOutputSchema = z.object({
  matches: z.array(MatchSchema),
  total_estimated_annual_value: z.number(),
  federal_only_value: z.number(),
  pdx_specific_value: z.number(),
  priority_application_order: z.array(z.string()),
  warnings: z.array(z.string()),
  // Present in AnalysisOutput type but omitted from current fixtures.
  caseworker_notes: z.string().optional(),
});

/** Validate + cast a parsed object to AnalysisOutput (throws ZodError on mismatch). */
export function parseAnalysis(obj: unknown): AnalysisOutput {
  return AnalysisOutputSchema.parse(obj) as AnalysisOutput;
}

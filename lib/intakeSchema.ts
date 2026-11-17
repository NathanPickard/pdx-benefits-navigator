import { z } from 'zod';
import type { IntakeData } from '@/types/program';

export const IntakeSchema = z.object({
  household_size: z.number().int().min(1).max(12),
  num_children: z.number().int().min(0).max(10),
  children_ages: z.array(z.number().int().min(0).max(17)),
  annual_income: z.number().min(0).max(500000),
  zip_code: z.string().regex(/^\d{5}$/, '5-digit ZIP'),
  housing_status: z.enum(['rent', 'own', 'unhoused', 'staying_with_others']),
  recent_rent_increase_pct: z.number().min(0).max(100).optional(),
  received_eviction_notice: z.boolean().optional(),
  has_disability: z.boolean(),
  is_veteran: z.boolean(),
  is_pregnant: z.boolean(),
  has_senior_in_household: z.boolean(),
  primary_language: z.enum(['en', 'es', 'vi', 'ru', 'zh', 'so', 'ar']),
  employment_status: z.enum([
    'employed_ft',
    'employed_pt',
    'self_employed',
    'unemployed',
    'retired',
    'disabled',
  ]),
  citizenship: z.enum(['citizen', 'lpr', 'other', 'prefer_not_say']),
});

// Compile-time guard: the schema and the IntakeData interface must describe
// the same shape. If either side changes alone, this assignment fails to typecheck.
type MutuallyAssignable<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;
const intakeSchemaMatchesIntakeData: MutuallyAssignable<z.infer<typeof IntakeSchema>, IntakeData> = true;
void intakeSchemaMatchesIntakeData;

type IntakeKey = keyof typeof IntakeSchema.shape;

// Validates a stored intake one field at a time. A field that is missing or
// fails its own schema takes the fallback value; valid fields are kept.
export function parseStoredIntakeFields(stored: unknown, fallback: IntakeData): IntakeData {
  if (typeof stored !== 'object' || stored === null) return fallback;
  const record = stored as Record<string, unknown>;
  const keys = Object.keys(IntakeSchema.shape) as IntakeKey[];
  return keys.reduce<IntakeData>((seeded, key) => {
    const value = record[key];
    if (value === undefined) return seeded;
    const parsed = IntakeSchema.shape[key].safeParse(value);
    return parsed.success ? { ...seeded, [key]: parsed.data } : seeded;
  }, fallback);
}

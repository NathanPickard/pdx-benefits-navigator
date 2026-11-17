import type { z } from 'zod';
import { AnalysisOutputSchema } from './eligibilitySchema';
import { IntakeSchema } from './intakeSchema';
import type { AnalysisOutput, IntakeData } from '@/types/program';

/**
 * sessionStorage keys shared by the intake form, the demo loader and the
 * results page. Keep every key here so readers and writers can't drift apart.
 */
export const SESSION_KEYS = {
  /** The submitted (or autosaved) intake answers, as JSON. */
  intake: 'pdx_intake',
  /** A pre-baked demo analysis, as JSON. Set by /demo/[scenario]. */
  prebaked: 'pdx_prebaked',
  /** '1' when the results page should replay the pre-baked analysis as a stream. */
  demoSimulate: 'pdx_demo_simulate',
} as const;

/**
 * Reads a sessionStorage key as JSON and validates it with `schema`.
 * Returns null when the key is missing, the JSON is invalid, the value does
 * not match the schema, or sessionStorage is unavailable.
 */
function readValidated<T>(key: string, schema: z.ZodType<T>): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = schema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** The submitted intake, or null if it is missing, partial or corrupt. */
export function readStoredIntake(): IntakeData | null {
  return readValidated(SESSION_KEYS.intake, IntakeSchema);
}

/** The pre-baked demo analysis, or null if it is missing or malformed. */
export function readPrebaked(): AnalysisOutput | null {
  return readValidated(SESSION_KEYS.prebaked, AnalysisOutputSchema);
}

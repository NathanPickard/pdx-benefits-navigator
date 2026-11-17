import { AnalysisOutputSchema } from './eligibilitySchema';
import type { AnalysisOutput, IntakeData } from '@/types/program';

const KEY = 'pdx_analysis';

/** JSON with object keys sorted at every level, so key order never changes the output. */
function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_key, v: unknown) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
      : v
  );
}

/** Cheap stable hash of the intake (FNV-1a over key-sorted JSON). */
export function hashIntake(intake: IntakeData): string {
  const s = canonicalJson(intake);
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16);
}

export function cacheAnalysis(intake: IntakeData, output: AnalysisOutput): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify({ hash: hashIntake(intake), output }));
  } catch {
    /* sessionStorage full / unavailable — non-fatal, analysis just won't survive refresh */
  }
}

export function readCachedAnalysis(intake: IntakeData): AnalysisOutput | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { hash?: unknown; output?: unknown };
    if (parsed?.hash !== hashIntake(intake)) return null;
    // A malformed cached analysis counts as a cache miss.
    const output = AnalysisOutputSchema.safeParse(parsed.output);
    return output.success ? output.data : null;
  } catch {
    return null;
  }
}

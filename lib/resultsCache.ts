import type { AnalysisOutput, IntakeData } from '@/types/program';

const KEY = 'pdx_analysis';

/** Cheap stable hash of the intake (FNV-1a over canonical JSON). */
export function hashIntake(intake: IntakeData): string {
  const s = JSON.stringify(intake);
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
    const parsed = JSON.parse(raw) as { hash: string; output: AnalysisOutput };
    return parsed.hash === hashIntake(intake) ? parsed.output : null;
  } catch {
    return null;
  }
}

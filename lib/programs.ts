import programsData from '@/data/programs.json';
import type { Program } from '@/types/program';

/** The full programs database (data/programs.json), typed. */
export const PROGRAMS: readonly Program[] = programsData as Program[];

/** Program lookup by id. */
export const PROGRAM_BY_ID: Map<string, Program> = new Map(
  PROGRAMS.map((p) => [p.id, p])
);

export const PROGRAM_COUNT: number = PROGRAMS.length;

export const HIDDEN_GEM_COUNT: number = PROGRAMS.filter((p) => p.hidden_gem).length;

/** The minimal row shape the gem-first comparator needs. */
export interface GemValueRow {
  match: { estimated_annual_value: number };
  program: { hidden_gem: boolean };
}

/**
 * Sort comparator: hidden-gem programs first (the differentiator), then by
 * estimated annual value, highest first.
 */
export function compareGemThenValue(a: GemValueRow, b: GemValueRow): number {
  if (a.program.hidden_gem !== b.program.hidden_gem) return a.program.hidden_gem ? -1 : 1;
  return b.match.estimated_annual_value - a.match.estimated_annual_value;
}

import type { MatchResult, Program } from '@/types/program';
import type { CalendarEntry } from '../calendar';
import { formatEstimate, formatNumber, hasEstimate } from '../estimate';
import { compareGemThenValue } from '../programs';

/** A match joined to its program record. */
export type EligibleRow = CalendarEntry;

export type SortMode = 'gems' | 'amount';

export interface RowFilters {
  category: Program['category'] | null;
  jurisdiction: Program['jurisdiction'] | null;
}

export interface LikelyRange {
  low: number;
  high: number;
}

/**
 * Joins each match to its program record, keeping the match order. Matches
 * whose program id is not in the lookup are dropped.
 */
export function joinPrograms(
  matches: readonly MatchResult[],
  programById: ReadonlyMap<string, Program>
): CalendarEntry[] {
  return matches.flatMap((match) => {
    const program = programById.get(match.program_id);
    return program ? [{ match, program }] : [];
  });
}

/** Keeps the rows that match the active category and jurisdiction filters. */
export function filterRows(
  rows: readonly EligibleRow[],
  { category, jurisdiction }: RowFilters
): EligibleRow[] {
  return rows.filter(
    (r) =>
      (!category || r.program.category === category) &&
      (!jurisdiction || r.program.jurisdiction === jurisdiction)
  );
}

/** Returns a sorted copy: hidden gems first, or by estimated value only. */
export function sortRows(rows: readonly EligibleRow[], mode: SortMode): EligibleRow[] {
  if (mode === 'amount') {
    return [...rows].sort(
      (a, b) => b.match.estimated_annual_value - a.match.estimated_annual_value
    );
  }
  return [...rows].sort(compareGemThenValue);
}

/**
 * The plain-text summary copied to the clipboard: a header line with the
 * total and match count, then one bullet per match.
 */
export function buildPlainTextSummary(
  totalAnnualValue: number,
  rows: readonly EligibleRow[]
): string {
  const count = rows.length;
  const header = `PDX Benefits Navigator — estimated $${formatNumber(totalAnnualValue)}/year across ${count} program${count !== 1 ? 's' : ''}`;
  const bullets = rows.map(({ match, program }) => {
    const value = match.estimated_annual_value;
    const amount = hasEstimate(value) ? `~${formatEstimate(value)}/yr` : formatEstimate(value);
    const step = match.next_steps?.[0] ?? program.short_name;
    return `• ${program.name} — ${amount} — ${step}`;
  });
  return [header, '', ...bullets].join('\n');
}

/**
 * The likely range: the sum of the official ranges of every match that
 * carries an estimate. Unestimated matches are skipped so they cannot widen
 * the band beyond the headline total, which also excludes them.
 */
export function likelyRange(rows: readonly EligibleRow[]): LikelyRange {
  return rows
    .filter(({ match }) => hasEstimate(match.estimated_annual_value))
    .reduce<LikelyRange>(
      (acc, { program }) => ({
        low: acc.low + program.estimated_annual_value.min,
        high: acc.high + program.estimated_annual_value.max,
      }),
      { low: 0, high: 0 }
    );
}

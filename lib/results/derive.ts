import type { MatchResult, Program } from '@/types/program';
import { hasEstimate } from '../estimate';

/** An eligible match joined to its program record. */
export interface EligibleRow {
  match: MatchResult;
  program: Program;
}

export interface LikelyRange {
  low: number;
  high: number;
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

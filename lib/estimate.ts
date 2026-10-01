import { CHROME_EN } from './i18n';

/**
 * True when a match carries an estimate. Per CONTEXT.md an estimate is always
 * above zero; a $0 (or missing/invalid) figure means an unestimated match.
 */
export function hasEstimate(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * The display text for a match's annual value: "$12,000" for an estimate,
 * otherwise the "Ask the program" label (pass the translated Chrome label in
 * the UI; English surfaces use the default).
 */
export function formatEstimate(
  value: number,
  askLabel: string = CHROME_EN.askTheProgram
): string {
  return hasEstimate(value) ? `$${value.toLocaleString('en-US')}` : askLabel;
}
